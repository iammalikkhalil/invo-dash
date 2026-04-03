"use client";

import { useEffect, useState } from "react";

export function useImageFailureState(url: string | null | undefined): [boolean, () => void] {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = Boolean(url && failedUrl === url);

  return [failed, () => setFailedUrl(url || "__missing__")];
}

export function usePreloadedImageFailure(
  url: string | null | undefined,
  enabled = true,
): boolean {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !url) return;

    let active = true;
    const image = new Image();

    image.onload = () => {
      if (!active) return;
      setFailedUrl((current) => (current === url ? null : current));
    };
    image.onerror = () => {
      if (!active) return;
      setFailedUrl(url);
    };
    image.src = url;

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [enabled, url]);

  return Boolean(url && failedUrl === url);
}
