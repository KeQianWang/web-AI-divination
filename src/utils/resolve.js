const getPathValue = (payload, path) => {
  if (!payload || typeof payload !== 'object') return undefined;
  return path.split('.').reduce((acc, key) => acc?.[key], payload);
};

const resolveListPayload = (payload, paths) => {
  if (!payload) return [];
  for (const path of paths) {
    const value = getPathValue(payload, path);
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(payload)) return payload;
  return [];
};

const resolveObjectPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  return payload.data || payload.result || payload;
};

export const resolveSessions = (payload) =>
  resolveListPayload(payload, [
    'sessions',
    'records',
    'list',
    'data.sessions',
    'data.records',
    'data.list',
    'result.sessions',
    'result.records',
    'result.list',
    'items',
    'data.items'
  ]);

export const resolveMessages = (payload) =>
  resolveListPayload(payload, [
    'messages',
    'history',
    'records',
    'data.messages',
    'data.history',
    'data.records',
    'result.messages',
    'result.history',
    'result.records',
    'items',
    'data.items'
  ]);

export const resolveSources = (payload) =>
  resolveListPayload(payload, ['sources', 'data.sources', 'result.sources']);

export const resolveProfile = (payload) => resolveObjectPayload(payload);

export const resolveSessionPayload = (payload) => resolveObjectPayload(payload);

export const resolveTokenPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  return resolveObjectPayload(payload);
};

export const getSessionId = (session) =>
  session?.session_id || session?.sessionId || session?.id || '';
