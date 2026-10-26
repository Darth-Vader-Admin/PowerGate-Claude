// Thin wrapper around the Catalyst Web SDK (window.catalyst), loaded in public/index.html.
import appConfig from "config/app";

function sdk() {
  return typeof window !== "undefined" ? window.catalyst : undefined;
}

export function isSdkAvailable() {
  const catalyst = sdk();
  return Boolean(catalyst && catalyst.auth);
}

// Resolves true when a Catalyst session exists, false otherwise.
export async function hasCatalystSession() {
  if (!isSdkAvailable()) return false;
  try {
    await sdk().auth.isUserAuthenticated();
    return true;
  } catch (notAuthenticated) {
    return false;
  }
}

function clientRoot() {
  // Catalyst serves the web client under /app/. Works for local `catalyst serve` too.
  const { origin, pathname } = window.location;
  const base = pathname.endsWith("/") ? pathname : pathname.replace(/[^/]*$/, "");
  return `${origin}${base}`;
}

// Renders the Catalyst embedded login iframe into the element with appConfig.loginElementId.
export function renderCatalystLogin() {
  if (!isSdkAvailable()) return false;
  const root = clientRoot();
    sdk().auth.signIn(appConfig.loginElementId, {
    // css_url removed: a custom file replaces Catalyst's default CSS entirely.
    // Re-add only with a full stylesheet based on Catalyst's default.
    service_url: `${root}index.html`,
  });
  return true;
}

export function catalystSignOut() {
  if (!isSdkAvailable()) return;
  sdk().auth.signOut(`${clientRoot()}index.html`);
}
