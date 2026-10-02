import { describe, it, expect } from "vitest";
import { apiSuccess, apiError, apiFail } from "./respond";
import { API_ERRORS } from "../inquiries/errors";

describe("apiSuccess", () => {
  it("wraps data in the ok:true envelope with a 200 default", async () => {
    const res = apiSuccess({ foo: "bar" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, data: { foo: "bar" } });
  });

  it("respects a custom status via init", () => {
    const res = apiSuccess({ created: true }, { status: 201 });
    expect(res.status).toBe(201);
  });
});

describe("apiError", () => {
  it("wraps a message/code in the ok:false envelope at the given status", async () => {
    const res = apiError("nope", 418, "teapot");
    expect(res.status).toBe(418);
    await expect(res.json()).resolves.toEqual({ ok: false, error: "nope", code: "teapot" });
  });
});

describe("apiFail", () => {
  // Every entry in the catalog gets a test for free — if someone adds a new
  // code to API_ERRORS without a status/message, this fails loudly.
  it.each(Object.entries(API_ERRORS))(
    'uses the catalog status/message for code "%s"',
    async (code, { status, message }) => {
      const res = apiFail(code as keyof typeof API_ERRORS);
      expect(res.status).toBe(status);
      await expect(res.json()).resolves.toEqual({ ok: false, error: message, code });
    }
  );

  it("overrides the default message when one is given, keeping the catalog status", async () => {
    const res = apiFail("not_found", "custom message for this case");
    expect(res.status).toBe(API_ERRORS.not_found.status);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "custom message for this case",
      code: "not_found",
    });
  });
});