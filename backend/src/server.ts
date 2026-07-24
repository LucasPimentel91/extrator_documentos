import { createApp } from "./app.js";
import { parseEnvironment } from "./config/env.js";
import { logger } from "./logging/logger.js";

const environment = parseEnvironment();
const app = createApp();

app.listen(environment.PORT, () => {
  logger.info("server_started", { status: 200 });
});
