type LogLevel = "info" | "error";
type LogValue = string | number | boolean | null | undefined;
type LogFields = Record<string, unknown>;

const allowedFields = new Set([
  "requestId",
  "status",
  "durationMs",
  "bytes",
  "type",
  "characters",
  "model",
  "ruleCount",
  "errorCode",
  "errorName",
]);

export interface Logger {
  info(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

export type LogSink = (serializedEntry: string) => void;

function defaultSink(serializedEntry: string): void {
  process.stdout.write(`${serializedEntry}\n`);
}

function sanitize(fields: LogFields): Record<string, LogValue> {
  return Object.fromEntries(
    Object.entries(fields).filter(
      (entry): entry is [string, LogValue] =>
        allowedFields.has(entry[0]) &&
        (entry[1] === null ||
          entry[1] === undefined ||
          ["string", "number", "boolean"].includes(typeof entry[1])),
    ),
  );
}

export function createLogger(sink: LogSink = defaultSink): Logger {
  const emit = (level: LogLevel, event: string, fields: LogFields = {}) => {
    sink(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        event,
        ...sanitize(fields),
      }),
    );
  };

  return {
    info: (event, fields) => emit("info", event, fields),
    error: (event, fields) => emit("error", event, fields),
  };
}

export const logger = createLogger();
