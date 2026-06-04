export function logError(error: unknown, context: string) {
  const payload = error instanceof Error ? { message: error.message, stack: error.stack } : { error };
  console.error(`[${context}]`, payload);
}
