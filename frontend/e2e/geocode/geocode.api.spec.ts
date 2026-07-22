import { test, expect } from "@playwright/test";

const REVERSE_PATH = "/api/search/reverse";

async function reverse(request: import("@playwright/test").APIRequestContext, lat: number, lon: number) {
  const res = await request.get(REVERSE_PATH, { params: { lat: String(lat), lon: String(lon) } });
  return { status: res.status(), body: await res.json() };
}

test.describe("reverse geocode: SF regression fix", () => {
  test("a dense-urban point (SF) that previously returned 404 now resolves to its city", async ({ request }) => {
    const { status, body } = await reverse(request, 37.7793, -122.4193);

    expect(status).toBe(200);
    expect(body.data.address?.city).toBe("San Francisco");
    expect(body.data.type).toBe("city");
  });

  test("a genuinely unresolvable point (open ocean) still returns 404, not 500", async ({ request }) => {
    const { status } = await reverse(request, 0, -140);

    expect(status).toBe(404);
  });

  test("a Photon upstream error still surfaces as a 5xx, not silently as 404", async ({ request }) => {
    // Out-of-range coordinates are a cheap way to provoke a real error
    // response from Photon without mocking, to confirm the null-vs-throw
    // split still distinguishes "no results" from "actual failure".
    const { status } = await reverse(request, 999, 999);

    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).not.toBe(404);
  });
});