declare const __PARKTHARA_PROJECT_DEMO__: boolean;

export const IS_PROJECT_DEMO = typeof __PARKTHARA_PROJECT_DEMO__ !== "undefined" && __PARKTHARA_PROJECT_DEMO__;
export const LIVE_APP_URL = "https://parkthara.sheerriver2.chatgpt.site";
export const PROJECT_BASE = IS_PROJECT_DEMO ? "/parkthara" : "";

export function publicPath(path: string, base = PROJECT_BASE) {
  return path.startsWith("/") && !path.startsWith("//") ? `${base}${path}` : path;
}

export function applicationPath(path: string, base = PROJECT_BASE) {
  if (base && (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`) || path.startsWith(`${base}#`))) {
    const rest = path.slice(base.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return path;
}

export function liveAppPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\r\n]/.test(path)) return LIVE_APP_URL;
  const url = new URL(path, LIVE_APP_URL);
  return url.origin === LIVE_APP_URL ? url.href : LIVE_APP_URL;
}
