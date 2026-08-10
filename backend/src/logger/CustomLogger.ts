function normalizeContext(context: unknown): unknown {
  if (context instanceof Error) {
    return {
      name: context.name,
      message: context.message,
      stack: context.stack
    };
  }
  return context;
}

function serializeContext(context: unknown): string {
  if (context === undefined) return '';
  try {
    return JSON.stringify(normalizeContext(context));
  } catch {
    return '[unserializable-context]';
  }
}

export class CustomLogger {
  static info(message: string, context?: unknown): void {
    console.log(`[INFO] [${new Date().toISOString()}] => ${message}`, serializeContext(context));
  }

  static warn(message: string, context?: unknown): void {
    console.warn(`[WARN] [${new Date().toISOString()}] => ${message}`, serializeContext(context));
  }

  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] [${new Date().toISOString()}] => ${message}`, serializeContext(error));
  }
}
