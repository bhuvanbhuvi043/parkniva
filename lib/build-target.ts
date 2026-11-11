declare const __PARKTHARA_PROJECT_DEMO__: boolean;

export const IS_PROJECT_DEMO = typeof __PARKTHARA_PROJECT_DEMO__ !== "undefined" && __PARKTHARA_PROJECT_DEMO__;
export const LIVE_APP_URL = "https://parkthara.sheerriver2.chatgpt.site";
export const PROJECT_BASE = IS_PROJECT_DEMO ? "/parkthara" : "";

export function publicPath(path: string, base = PROJECT_BASE) {
  return path.startsWith("/") && !path.startsWith("//") ? `${base}${path}` : path;
}

export function applicationPath(path: string, base = PROJECT_BASE) {
  let logical = path;
  if (base && (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`) || path.startsWith(`${base}#`))) {
    const rest = path.slice(base.length);
    logical = rest.startsWith("/") ? rest : `/${rest}`;
  }
  // Static hosts redirect directory URLs to a trailing slash. Keep query/hash
  // intact while matching the same logical screen as client-side navigation.
  const boundary = logical.search(/[?#]/);
  return `${(boundary < 0 ? logical : logical.slice(0, boundary)).replace(/\/+$/, "") || "/"}${boundary < 0 ? "" : logical.slice(boundary)}`;
}

export function liveAppPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\r\n]/.test(path)) return LIVE_APP_URL;
  const url = new URL(path, LIVE_APP_URL);
  return url.origin === LIVE_APP_URL ? url.href : LIVE_APP_URL;
}
