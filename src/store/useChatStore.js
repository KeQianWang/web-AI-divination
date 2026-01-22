import { create } from 'zustand';
import { chat, knowledge, sessions, streamChat } from '../api/client';
import { buildHistory, updateLastAssistantMood } from '../utils/history';
import {
  getSessionId,
  resolveMessages,
  resolveSessionPayload,
  resolveSessions,
  resolveSources
} from '../utils/resolve';
import useUserStore from './useUserStore';

const initialState = {
  sessionsList: [],
  activeSessionId: '',
  messagesSessionId: '',
  messages: [],
  chatInput: '',
  chatError: '',
  historyLoading: false,
  isStreaming: false,
  ttsEnabled: false,
  knowledgeUrl: '',
  knowledgeFile: null,
  knowledgeAttachSession: true,
  knowledgeMessage: '',
  knowledgeError: false,
  knowledgeLoading: false,
  knowledgeFileKey: 0,
  knowledgeSources: [],
  knowledgeSourcesLoading: false,
  knowledgeSourcesError: '',
  bootstrapped: false
};

const typingState = {
  queue: [],
  timer: null,
  targetId: ''
};

const stopTyping = () => {
  if (typingState.timer) {
    clearInterval(typingState.timer);
    typingState.timer = null;
  }
  typingState.queue = [];
};

const startTyping = (set) => {
  if (typingState.timer) return;
  typingState.timer = setInterval(() => {
    const nextBatch = typingState.queue.splice(0, 2).join('');
    if (!nextBatch) {
      clearInterval(typingState.timer);
      typingState.timer = null;
      return;
    }
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === typingState.targetId
          ? { ...message, content: message.content + nextBatch }
          : message
      )
    }));
  }, 20);
};

const enqueueTyping = (set, assistantId, text) => {
  if (!text) return;
  typingState.targetId = assistantId;
  typingState.queue.push(...text.split(''));
  startTyping(set);
};

const handleAuthError = (error) => {
  if (error?.status === 401) {
    useUserStore.getState().logout();
  }
};

const getToken = () => useUserStore.getState().token;

const useChatStore = create((set, get) => ({
  ...initialState,
  resetChat() {
    stopTyping();
    set({ ...initialState });
  },
  setChatInput(value) {
    set({ chatInput: value });
  },
  setTtsEnabled(value) {
    set({ ttsEnabled: value });
  },
  setKnowledgeUrl(value) {
    set({ knowledgeUrl: value });
  },
  setKnowledgeFile(file) {
    set({ knowledgeFile: file });
  },
  setKnowledgeAttachSession(value) {
    set({ knowledgeAttachSession: value });
  },
  setActiveSessionId(sessionId) {
    set({ activeSessionId: sessionId });
  },
  clearKnowledgeSources() {
    set({
      knowledgeSources: [],
      knowledgeSourcesError: '',
      knowledgeSourcesLoading: false
    });
  },
  async bootstrap() {
    if (get().bootstrapped) return;
    if (!getToken()) return;
    await get().refreshSessions();
    set({ bootstrapped: true });
  },
  async refreshSessions() {
    const token = getToken();
    if (!token) return;
    try {
      const data = await sessions.list(token);
      set({ sessionsList: resolveSessions(data) });
    } catch (error) {
      handleAuthError(error);
    }
  },
  async loadHistory(sessionId) {
    if (!sessionId) return;
    const token = getToken();
    if (!token) return;
    set({ historyLoading: true, chatError: '', messages: [], messagesSessionId: sessionId });
    stopTyping();
    try {
      const data = await chat.history(token, sessionId);
      set({ messages: buildHistory(resolveMessages(data)) });
    } catch (error) {
      handleAuthError(error);
      set({ chatError: error.message || '历史记录加载失败。' });
    } finally {
      set({ historyLoading: false });
    }
  },
  async loadKnowledgeSources(sessionId) {
    if (!sessionId) return;
    set({ knowledgeSourcesLoading: true, knowledgeSourcesError: '' });
    try {
      const data = await knowledge.list(sessionId);
      set({ knowledgeSources: resolveSources(data) });
    } catch (error) {
      set({
        knowledgeSources: [],
        knowledgeSourcesError: error.message || '知识库内容加载失败。'
      });
    } finally {
      set({ knowledgeSourcesLoading: false });
    }
  },
  async createSession() {
    const token = getToken();
    if (!token) return '';
    try {
      const result = await sessions.create(token, { title: '新会话' });
      const sessionPayload = resolveSessionPayload(result);
      const sessionId = getSessionId(sessionPayload);
      await get().refreshSessions();
      set({ activeSessionId: sessionId, messages: [], messagesSessionId: sessionId });
      return sessionId;
    } catch (error) {
      handleAuthError(error);
      return '';
    }
  },
  async renameSession(sessionId, nextTitle) {
    const token = getToken();
    if (!token || !sessionId) return;
    try {
      await sessions.update(token, sessionId, { title: nextTitle });
      await get().refreshSessions();
    } catch (error) {
      handleAuthError(error);
    }
  },
  async deleteSession(sessionId) {
    const token = getToken();
    if (!token || !sessionId) return;
    try {
      await sessions.remove(token, sessionId);
      await get().refreshSessions();
      if (get().activeSessionId === sessionId) {
        set({ activeSessionId: '', messages: [], messagesSessionId: '' });
        get().clearKnowledgeSources();
      }
    } catch (error) {
      handleAuthError(error);
    }
  },
  async sendMessage(overrideText) {
    const { chatInput, isStreaming, activeSessionId, ttsEnabled } = get();
    const rawText = typeof overrideText === 'string' ? overrideText : chatInput;
    const messageText = rawText.trim();
    if (!messageText || isStreaming) return;
    set({ chatError: '', chatInput: '' });
    stopTyping();

    let currentSessionId = activeSessionId;
    const token = getToken();
    if (!token) return;
    if (!currentSessionId) {
      try {
        const result = await sessions.create(token, {
          title: messageText.slice(0, 16) || '新会话'
        });
        const sessionPayload = resolveSessionPayload(result);
        currentSessionId = getSessionId(sessionPayload);
        if (!currentSessionId) {
          set({ chatError: '创建会话失败。' });
          return;
        }
        set({
          activeSessionId: currentSessionId,
          messages: [],
          messagesSessionId: currentSessionId
        });
      } catch (error) {
        handleAuthError(error);
        set({ chatError: error.message || '创建会话失败。' });
        return;
      }
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString()
    };
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      isStreaming: true,
      messagesSessionId: currentSessionId
    }));

    const fetchLatestMood = async (sessionId) => {
      if (!sessionId) return;
      try {
        const data = await chat.history(token, sessionId);
        const list = resolveMessages(data);
        const last = list[list.length - 1];
        const mood = last?.mood;
        if (mood) {
          set((state) => ({ messages: updateLastAssistantMood(state.messages, mood) }));
        }
      } catch {
        // Ignore mood sync failures.
      }
    };

    try {
      await streamChat({
        token,
        query: userMessage.content,
        sessionId: currentSessionId,
        enableTts: ttsEnabled,
        onToken: (chunk) => {
          enqueueTyping(set, assistantId, chunk);
        },
        onDone: (payload) => {
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    streaming: false,
                    audioUrl: payload.audio_url || ''
                  }
                : message
            )
          }));
          const nextSessionId = payload.session_id || currentSessionId;
          if (payload.mood) {
            set((state) => ({ messages: updateLastAssistantMood(state.messages, payload.mood) }));
          } else {
            fetchLatestMood(nextSessionId);
          }
          if (payload.session_id && payload.session_id !== currentSessionId) {
            set({
              activeSessionId: payload.session_id,
              messagesSessionId: payload.session_id
            });
          }
        }
      });
      await get().refreshSessions();
    } catch (error) {
      handleAuthError(error);
      set({
        chatError: error.message || '聊天失败。',
        messages: get().messages.map((message) =>
          message.id === assistantId ? { ...message, streaming: false } : message
        )
      });
      stopTyping();
    } finally {
      set({ isStreaming: false });
    }
  },
  async submitKnowledge() {
    set({ knowledgeMessage: '', knowledgeError: false });
    const {
      knowledgeAttachSession,
      activeSessionId,
      knowledgeUrl,
      knowledgeFile
    } = get();
    const trimmedUrl = knowledgeUrl.trim();
    if (!knowledgeAttachSession) {
      set({ knowledgeMessage: '请先关联当前会话。', knowledgeError: true });
      return;
    }
    if (!activeSessionId) {
      set({ knowledgeMessage: '请先选择一个会话。', knowledgeError: true });
      return;
    }
    if (!trimmedUrl && !knowledgeFile) {
      set({ knowledgeMessage: '请提供链接或文件。', knowledgeError: true });
      return;
    }

    set({ knowledgeLoading: true });
    try {
      const token = getToken();
      const result = await knowledge.add({
        token,
        url: trimmedUrl || undefined,
        file: knowledgeFile,
        sessionId: activeSessionId
      });
      const payloadMessage = result?.message || result?.msg || '知识已添加。';
      set((state) => ({
        knowledgeMessage: payloadMessage,
        knowledgeError: false,
        knowledgeUrl: '',
        knowledgeFile: null,
        knowledgeFileKey: state.knowledgeFileKey + 1
      }));
      await get().loadKnowledgeSources(activeSessionId);
    } catch (error) {
      handleAuthError(error);
      set({ knowledgeMessage: error.message || '上传失败。', knowledgeError: true });
    } finally {
      set({ knowledgeLoading: false });
    }
  },
  stopTyping() {
    stopTyping();
  }
}));

useUserStore.subscribe(
  (state) => state.token,
  (token) => {
    if (!token) {
      useChatStore.getState().resetChat();
    }
  }
);

export default useChatStore;
