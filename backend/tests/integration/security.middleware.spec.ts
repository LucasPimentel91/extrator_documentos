import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";

describe("security middleware", () => {
  it("allows only the configured browser origin", async () => {
    const app = createApp({
      frontendOrigin: "http://localhost:4200",
      rateLimitMax: 10,
      rateLimitWindowMs: 60_000,
    });

    const allowed = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:4200");
    const denied = await request(app)
      .get("/health")
      .set("Origin", "https://malicious.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:4200",
    );
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("sets security headers", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("returns the standard envelope after the configured request limit", async () => {
    const app = createApp({ rateLimitMax: 1, rateLimitWindowMs: 60_000 });

    expect((await request(app).get("/health")).status).toBe(200);
    const limited = await request(app).get("/health");

    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatchObject({
      code: "RATE_LIMITED",
      requestId: expect.any(String),
    });
  });
});
