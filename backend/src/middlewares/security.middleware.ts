import cors from "cors";
import helmet from "helmet";

export function securityMiddleware(frontendOrigin: string) {
  return [
    helmet(),
    cors({
      origin(origin, callback) {
        callback(null, origin === undefined || origin === frontendOrigin);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id", "RateLimit", "RateLimit-Policy"],
    }),
  ] as const;
}
