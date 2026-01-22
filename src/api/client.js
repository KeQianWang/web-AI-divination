const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const buildHeaders = (token, isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseError = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg).join(', ');
    }
    return data.detail || 'Request failed';
  }
  const text = await response.text();
  return text || 'Request failed';
};

const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  const dataKeys = ['data', 'result'];
  for (const key of dataKeys) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const keys = Object.keys(payload);
      const allowed = new Set(['data', 'result', 'message', 'msg', 'code', 'status', 'success']);
      if (keys.every((item) => allowed.has(item))) {
        return payload[key];
      }
    }
  }
  return payload;
};

const parseSsePayload = (jsonText) => {
  if (!jsonText) return null;
  try {
    return JSON.parse(jsonText);
  } catch {
    let normalized = jsonText.trim();
    if (!normalized) return null;
    normalized = normalized
      .replace(/\bNone\b/g, 'null')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false');
    const placeholder = '__SINGLE_QUOTE__';
    normalized = normalized.replace(/\\'/g, placeholder);
    normalized = normalized.replace(/'/g, '"');
    normalized = normalized.replace(new RegExp(placeholder, 'g'), "'");
    try {
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
};

const request = async (path, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(token, method !== 'GET'),
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = new Error(await parseError(response));
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  return unwrapPayload(data);
};

export const auth = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  update: (token, payload) => request('/auth/update_me', { method: 'PUT', token, body: payload })
};

export const sessions = {
  list: (token) => request('/sessions/get_sessions?skip=0&limit=50', { token }),
  create: (token, payload) => request('/sessions/creat_sessions', { method: 'POST', token, body: payload }),
  update: (token, sessionId, payload) =>
    request(`/sessions/update/${sessionId}`, { method: 'PUT', token, body: payload }),
  remove: (token, sessionId) => request(`/sessions/delete/${sessionId}`, { method: 'DELETE', token })
};

export const chat = {
  history: (token, sessionId) =>
    request(`/chat/history?session_id=${encodeURIComponent(sessionId)}&skip=0&limit=50`, { token }),
  stats: (token) => request('/chat/stats', { token }),
  recent: (token, days = 7) => request(`/chat/recent?days=${days}`, { token }),
  send: (token, payload) => request('/chat', { method: 'POST', token, body: payload })
};

export const knowledge = {
  add: async ({ token, url, file, sessionId }) => {
    const form = new FormData();
    if (url) form.append('url', url);
    if (file) form.append('file', file);
    if (sessionId) form.append('session_id', sessionId);

    const response = await fetch(`${API_BASE}/add_knowledge`, {
      method: 'POST',
      headers: buildHeaders(token, false),
      body: form
    });

    if (!response.ok) {
      const error = new Error(await parseError(response));
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return unwrapPayload(data);
  },
  list: (sessionId) => request(`/knowledge/${encodeURIComponent(sessionId)}`)
};

export const streamChat = async ({ token, query, sessionId, enableTts, onToken, onDone }) => {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: buildHeaders(token, true),
    body: JSON.stringify({
      query,
      session_id: sessionId || undefined,
      enable_tts: Boolean(enableTts),
      async_mode: true
    })
  });

  if (!response.ok || !response.body) {
    const error = new Error(await parseError(response));
    error.status = response.status;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let didStreamContent = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const jsonText = trimmed.replace(/^data:\s*/, '');
      if (!jsonText) continue;
      if (jsonText === '[DONE]' || jsonText === 'DONE') {
        onDone?.({ session_id: sessionId || null, audio_url: null });
        continue;
      }

      const payload = parseSsePayload(jsonText);
      if (!payload) continue;

      if (payload.type === 'content') {
        const chunk = payload.content || '';
        if (chunk) {
          didStreamContent = true;
          onToken?.(chunk);
        }
        continue;
      }

      if (payload.type === 'complete') {
        const finalContent = payload.content || '';
        if (finalContent && !didStreamContent) {
          didStreamContent = true;
          onToken?.(finalContent);
        }
        onDone?.(payload);
        continue;
      }

      if (payload.audio_url) {
        onDone?.(payload);
      }
    }
  }
};

export const baseUrl = API_BASE;
