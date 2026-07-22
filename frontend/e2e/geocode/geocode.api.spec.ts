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
});