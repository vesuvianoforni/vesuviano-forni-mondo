import { lazy, ComponentType } from "react";

/**
 * Wraps React.lazy with auto-recovery for stale dynamic-import errors.
 * 
 * Why: After a deploy or HMR reload, the browser may try to fetch a chunk
 * URL with an old hash/timestamp that no longer exists, throwing
 * "Failed to fetch dynamically imported module". A one-time hard reload
 * fetches the fresh index.html and resolves the issue.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const STORAGE_KEY = "lazy-retry-reloaded";
    try {
      const component = await factory();
      // Success: clear the flag so future failures can trigger another reload.
      window.sessionStorage.removeItem(STORAGE_KEY);
      return component;
    } catch (err: any) {
      const message = String(err?.message || "");
      const isChunkError =
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Importing a module script failed") ||
        message.includes("error loading dynamically imported module");

      const alreadyReloaded = window.sessionStorage.getItem(STORAGE_KEY);

      if (isChunkError && !alreadyReloaded) {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
        window.location.reload();
        // Return a never-resolving promise while the page reloads.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
