import { SAFE_ERROR_MESSAGE } from "@/lib/safeErrors";

const SAFE_ERROR_BODY = JSON.stringify({
  success: false,
  message: SAFE_ERROR_MESSAGE,
});

const originalFetch = globalThis.fetch?.bind(globalThis);

if (originalFetch) {
  globalThis.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);

      if (!response.ok) {
        const headers = new Headers(response.headers);
        headers.set("content-type", "application/json");

        return new Response(SAFE_ERROR_BODY, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return response;
    } catch {
      return new Response(SAFE_ERROR_BODY, {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "content-type": "application/json" },
      });
    }
  };
}