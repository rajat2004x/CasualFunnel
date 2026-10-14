export function createSession() {
  const storageKey = 'cf_session_id';
  const existingId = globalThis.localStorage?.getItem(storageKey);
  const sessionId =
    existingId ??
    (globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  globalThis.localStorage?.setItem(storageKey, sessionId);

  return {
    id: sessionId,
    startedAt: new Date().toISOString(),
    pageViews: 0
  };
}
