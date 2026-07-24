import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { AppError } from "../../../src/errors/app-error.js";
import { errorMiddleware } from "../../../src/middlewares/error.middleware.js";
import { requestIdMiddleware } from "../../../src/middlewares/request-id.middleware.js";

function testApp(error: unknown) {
  const app = express();
  app.use(requestIdMiddleware);
  app.get("/error", () => {
    throw error;
  });
  app.use(errorMiddleware);
  return app;
}

describe("errorMiddleware", () => {
  it("maps a known error to the public envelope", async () => {
    const response = await request(
      testApp(new AppError("INVALID_FILE_TYPE", 400, "Arquivo inválido.")),
    ).get("/error");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_FILE_TYPE",
        message: "Arquivo inválido.",
        requestId: expect.any(String),
      },
    });
  });

  it("redacts unknown errors", async () => {
    const response = await request(testApp(new Error("secret detail"))).get(
      "/error",
    );

    expect(response.status).toBe(500);
    expect(response.body.error).toMatchObject({
      code: "INTERNAL_ERROR",
      message: "Ocorreu um erro interno.",
      requestId: expect.any(String),
    });
    expect(JSON.stringify(response.body)).not.toContain("secret detail");
  });
});
