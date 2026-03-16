import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BrowserInstance = Awaited<ReturnType<typeof puppeteer.launch>>;

const globalPdfBrowser = globalThis as typeof globalThis & {
  __invoicePdfBrowser?: BrowserInstance;
  __invoicePdfBrowserPromise?: Promise<BrowserInstance>;
};

function sanitizeFileName(input: string): string {
  return input.replace(/[\\/:*?"<>|]/g, "_");
}

async function getBrowser(): Promise<BrowserInstance> {
  if (globalPdfBrowser.__invoicePdfBrowser?.connected) {
    return globalPdfBrowser.__invoicePdfBrowser;
  }

  if (!globalPdfBrowser.__invoicePdfBrowserPromise) {
    globalPdfBrowser.__invoicePdfBrowserPromise = puppeteer
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .then((browser) => {
        globalPdfBrowser.__invoicePdfBrowser = browser;
        browser.on("disconnected", () => {
          globalPdfBrowser.__invoicePdfBrowser = undefined;
          globalPdfBrowser.__invoicePdfBrowserPromise = undefined;
        });
        return browser;
      });
  }

  return globalPdfBrowser.__invoicePdfBrowserPromise;
}

// Warm the browser once per server process to reduce first-request latency.
void getBrowser();

export async function GET(request: Request): Promise<Response> {
  let page: Awaited<ReturnType<BrowserInstance["newPage"]>> | null = null;

  try {
    const requestUrl = new URL(request.url);
    const renderUrl = new URL("/invoice-preview?pdf=1", requestUrl.origin).toString();
    const fileName = sanitizeFileName(
      requestUrl.searchParams.get("filename") || "invoice-preview",
    );

    const browser = await getBrowser();
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(5000);
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.goto(renderUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForSelector('[data-invoice-page="true"]', { timeout: 5000 });

    // Wait for client-side pagination measurements to settle before PDF capture.
    await page.waitForFunction(
      () => Boolean(document.querySelector('[data-invoice-pagination-ready="1"]')),
      { timeout: 12000 },
    );

    await page.evaluate(async () => {
      function withTimeout<T>(task: Promise<T>, timeoutMs: number): Promise<T | null> {
        return new Promise<T | null>((resolve) => {
          let done = false;
          const timer = window.setTimeout(() => {
            if (!done) {
              done = true;
              resolve(null);
            }
          }, timeoutMs);

          task
            .then((value) => {
              if (done) return;
              done = true;
              window.clearTimeout(timer);
              resolve(value);
            })
            .catch(() => {
              if (done) return;
              done = true;
              window.clearTimeout(timer);
              resolve(null);
            });
        });
      }

      if ("fonts" in document) {
        await withTimeout(document.fonts.ready, 2500);
      }

      // Wait for image assets, but do not block indefinitely.
      await Promise.all(
        Array.from(document.querySelectorAll("img")).map((image) => {
          if (image.complete) return Promise.resolve<void>(undefined);
          return withTimeout(
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
            2500,
          ).then(() => undefined);
        }),
      );

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF generation error";
    return Response.json(
      { error: { code: "PDF_GENERATION_FAILED", message } },
      { status: 500 },
    );
  } finally {
    if (page) {
      await page.close();
    }
  }
}
