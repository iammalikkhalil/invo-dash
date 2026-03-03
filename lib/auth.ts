export const TOKEN_STORAGE_KEY = "webpanel_access_token";
const SESSION_EXPIRED_KEY = "webpanel_session_expired";

export function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!hasWindow()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(options?: { sessionExpired?: boolean }): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);

  if (options?.sessionExpired) {
    window.localStorage.setItem(SESSION_EXPIRED_KEY, "1");
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

export function consumeSessionExpiredFlag(): boolean {
  if (!hasWindow()) {
    return false;
  }

  const flag = window.localStorage.getItem(SESSION_EXPIRED_KEY);

  if (!flag) {
    return false;
  }

  window.localStorage.removeItem(SESSION_EXPIRED_KEY);
  return true;
}
