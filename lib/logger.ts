type Level = "INFO" | "WARN" | "ERROR";

function emit(level: Level, route: string, msg: string, ctx?: Record<string, unknown>) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    route,
    msg,
    ...ctx,
  });
  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (route: string, msg: string, ctx?: Record<string, unknown>) => emit("INFO", route, msg, ctx),
  warn: (route: string, msg: string, ctx?: Record<string, unknown>) => emit("WARN", route, msg, ctx),
  error: (route: string, msg: string, ctx?: Record<string, unknown>) => emit("ERROR", route, msg, ctx),
};
