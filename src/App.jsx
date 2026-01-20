import React, { useEffect, useRef, useState } from 'react';
import { auth, sessions, chat, knowledge, streamChat, baseUrl } from './api/client';
import AuthPage from './components/AuthPage';
import AppHeader from './components/AppHeader';
import SessionsPanel from './components/SessionsPanel';
import ChatPanel from './components/ChatPanel';
import KnowledgePanel from './components/KnowledgePanel';
import ProfileModal from './components/ProfileModal';
import { buildHistory, updateLastAssistantMood } from './utils/history';
import {
  resolveSessions,
  resolveMessages,
  resolveSources,
  resolveProfile,
  resolveSessionPayload,
  resolveTokenPayload,
  getSessionId
} from './utils/resolve';
import { normalizeAvatarBase64 } from './utils/formatters';

const emptyProfile = {
  username: '',
  email: '',
  avatar_url: ''
};

const emptyAuthForm = {
  username: '',
  password: '',
  phone: ''
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '');
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [profileMessage, setProfileMessage] = useState('');
  const [sessionsList, setSessionsList] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [knowledgeUrl, setKnowledgeUrl] = useState('');
  const [knowledgeFile, setKnowledgeFile] = useState(null);
  const [knowledgeAttachSession, setKnowledgeAttachSession] = useState(true);
  const [knowledgeMessage, setKnowledgeMessage] = useState('');
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeFileKey, setKnowledgeFileKey] = useState(0);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [knowledgeSourcesLoading, setKnowledgeSourcesLoading] = useState(false);
  const [knowledgeSourcesError, setKnowledgeSourcesError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarFileKey, setAvatarFileKey] = useState(0);
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authError, setAuthError] = useState('');
  const typingQueueRef = useRef([]);
  const typingTimerRef = useRef(null);
  const typingTargetRef = useRef('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const userMenuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 900;
  });
  const [sessionsDrawerOpen, setSessionsDrawerOpen] = useState(false);
  const [knowledgeDrawerOpen, setKnowledgeDrawerOpen] = useState(false);

  const authenticated = Boolean(token);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const nextIsMobile = window.innerWidth <= 900;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setSessionsDrawerOpen(false);
        setKnowledgeDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sessionsDrawerOpen || knowledgeDrawerOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [sessionsDrawerOpen, knowledgeDrawerOpen]);


  const handleAuthError = (error) => {
    if (error?.status === 401) {
      handleLogout();
    }
  };

  const stopTyping = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    typingQueueRef.current = [];
  };

  const startTyping = () => {
    if (typingTimerRef.current) return;
    typingTimerRef.current = setInterval(() => {
      const nextBatch = typingQueueRef.current.splice(0, 2).join('');
      if (!nextBatch) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        return;
      }
      setMessages((prev) =>
        prev.map((message) =>
          message.id === typingTargetRef.current
            ? { ...message, content: message.content + nextBatch }
            : message
        )
      );
    }, 20);
  };

  const enqueueTyping = (assistantId, text) => {
    if (!text) return;
    typingTargetRef.current = assistantId;
    typingQueueRef.current.push(...text.split(''));
    startTyping();
  };

  const scrollToBottom = (behavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  const handleToggleSessionsDrawer = () => {
    setSessionsDrawerOpen((open) => !open);
    setKnowledgeDrawerOpen(false);
  };

  const handleToggleKnowledgeDrawer = () => {
    setKnowledgeDrawerOpen((open) => !open);
    setSessionsDrawerOpen(false);
  };

  const handleCloseDrawers = () => {
    setSessionsDrawerOpen(false);
    setKnowledgeDrawerOpen(false);
  };

  const refreshSessions = async () => {
    const data = await sessions.list(token);
    setSessionsList(resolveSessions(data));
  };

  const loadHistory = async (sessionId) => {
    if (!sessionId) return;
    setHistoryLoading(true);
    stopTyping();
    setChatError('');
    setMessages([]);
    try {
      const data = await chat.history(token, sessionId);
      setMessages(buildHistory(resolveMessages(data)));
    } catch (error) {
      handleAuthError(error);
      setChatError(error.message || '历史记录加载失败。');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadKnowledgeSources = async (sessionId) => {
    if (!sessionId) return;
    setKnowledgeSourcesLoading(true);
    setKnowledgeSourcesError('');
    try {
      const data = await knowledge.list(sessionId);
      setKnowledgeSources(resolveSources(data));
    } catch (error) {
      setKnowledgeSources([]);
      setKnowledgeSourcesError(error.message || '知识库内容加载失败。');
    } finally {
      setKnowledgeSourcesLoading(false);
    }
  };

  const loadBootstrap = async () => {
    try {
      const [meResult, sessionResult] = await Promise.all([
        auth.me(token),
        sessions.list(token)
      ]);
      const profilePayload = resolveProfile(meResult);
      setUser(profilePayload);
      setProfileForm({
        username: profilePayload?.username || '',
        email: profilePayload?.email || '',
        avatar_url: profilePayload?.avatar_url || ''
      });
      setSessionsList(resolveSessions(sessionResult));
    } catch (error) {
      handleAuthError(error);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    loadBootstrap();
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !activeSessionId) return;
    loadHistory(activeSessionId).catch(() => {});
    return () => {};
  }, [authenticated, activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setKnowledgeSources([]);
      setKnowledgeSourcesError('');
      setKnowledgeSourcesLoading(false);
      return;
    }
    loadKnowledgeSources(activeSessionId).catch(() => {});
  }, [activeSessionId]);

  useEffect(() => {
    if (!activeSessionId && sessionsList.length > 0) {
      setActiveSessionId(getSessionId(sessionsList[0]));
    }
  }, [sessionsList, activeSessionId]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken('');
    setUser(null);
    setSessionsList([]);
    setActiveSessionId('');
    setMessages([]);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    try {
      if (authTab === 'login') {
        const result = await auth.login({
          username: authForm.username,
          password: authForm.password
        });
        const payload = resolveTokenPayload(result);
        localStorage.setItem('access_token', payload.access_token);
        setToken(payload.access_token);
      } else {
        await auth.register({
          username: authForm.username,
          password: authForm.password,
          phone: authForm.phone
        });
        setAuthTab('login');
        setAuthError('注册成功，请登录。');
      }
    } catch (error) {
      setAuthError(error.message || '请求失败。');
    }
  };

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    try {
      const avatarBase64 = normalizeAvatarBase64(profileForm.avatar_url);
      const payload = {
        username: profileForm.username || undefined,
        email: profileForm.email || undefined,
        avatar_url: avatarBase64 || undefined
      };
      const updated = await auth.update(token, payload);
      const profilePayload = resolveProfile(updated);
      const mergedAvatar =
        profilePayload && Object.prototype.hasOwnProperty.call(profilePayload, 'avatar_url')
          ? profilePayload.avatar_url
          : profileForm.avatar_url || user?.avatar_url || '';
      const mergedProfile = {
        ...(user || {}),
        ...(profilePayload || {}),
        avatar_url: mergedAvatar
      };
      setUser(mergedProfile);
      setProfileForm({
        username: mergedProfile.username || '',
        email: mergedProfile.email || '',
        avatar_url: mergedProfile.avatar_url || ''
      });
      setProfileMessage('资料已更新。');
      setAvatarFileKey((prev) => prev + 1);
    } catch (error) {
      handleAuthError(error);
      setProfileMessage(error.message || '更新失败。');
    }
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfileForm((prev) => ({ ...prev, avatar_url: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfileForm((prev) => ({ ...prev, avatar_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchLatestMood = async (sessionId) => {
    if (!sessionId) return;
    try {
      const data = await chat.history(token, sessionId);
      const list = resolveMessages(data);
      const last = list[list.length - 1];
      const mood = last?.mood;
      if (mood) {
        setMessages((prev) => updateLastAssistantMood(prev, mood));
      }
    } catch {
      // Ignore mood sync failures.
    }
  };

  const openProfileModal = () => {
    setProfileMessage('');
    setProfileOpen(true);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen((prev) => !prev);
  };

  const handleOpenProfile = () => {
    setUserMenuOpen(false);
    openProfileModal();
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    handleLogout();
  };

  const handleCreateSession = async () => {
    try {
      const result = await sessions.create(token, { title: '新会话' });
      const sessionPayload = resolveSessionPayload(result);
      await refreshSessions();
      setActiveSessionId(
        sessionPayload?.session_id || sessionPayload?.sessionId || sessionPayload?.id || ''
      );
      setMessages([]);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('确认删除该会话？')) return;
    try {
      await sessions.remove(token, sessionId);
      await refreshSessions();
      if (activeSessionId === sessionId) {
        setActiveSessionId('');
        setMessages([]);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleRenameSession = async (sessionId, currentTitle) => {
    const nextTitle = window.prompt('重命名会话', currentTitle || '');
    if (nextTitle === null) return;
    try {
      await sessions.update(token, sessionId, { title: nextTitle });
      await refreshSessions();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleSend = async (overrideText) => {
    const rawText = typeof overrideText === 'string' ? overrideText : chatInput;
    const messageText = rawText.trim();
    if (!messageText || isStreaming) return;
    setChatError('');
    stopTyping();
    setChatInput('');

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        const result = await sessions.create(token, {
          title: messageText.slice(0, 16) || '新会话'
        });
        const sessionPayload = resolveSessionPayload(result);
        currentSessionId =
          sessionPayload?.session_id || sessionPayload?.sessionId || sessionPayload?.id;
        if (!currentSessionId) {
          setChatError('创建会话失败。');
          return;
        }
        setActiveSessionId(currentSessionId);
        await refreshSessions();
      } catch (error) {
        handleAuthError(error);
        setChatError(error.message || '创建会话失败。');
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

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      await streamChat({
        token,
        query: userMessage.content,
        sessionId: currentSessionId,
        enableTts: ttsEnabled,
        onToken: (chunk) => {
          enqueueTyping(assistantId, chunk);
        },
        onDone: (payload) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    streaming: false,
                    audioUrl: payload.audio_url || ''
                  }
                : message
            )
          );
          const nextSessionId = payload.session_id || currentSessionId;
          if (payload.mood) {
            setMessages((prev) => updateLastAssistantMood(prev, payload.mood));
          } else {
            fetchLatestMood(nextSessionId);
          }
          if (payload.session_id && payload.session_id !== currentSessionId) {
            setActiveSessionId(payload.session_id);
          }
        }
      });
      await refreshSessions();
    } catch (error) {
      handleAuthError(error);
      setChatError(error.message || '聊天失败。');
      stopTyping();
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, streaming: false } : message
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectSession = (sessionId) => {
    if (!sessionId) return;
    if (sessionId === activeSessionId) {
      loadHistory(sessionId).catch(() => {});
      return;
    }
    setActiveSessionId(sessionId);
  };

  const handleKnowledgeSubmit = async (event) => {
    event.preventDefault();
    setKnowledgeMessage('');
    setKnowledgeError(false);

    const trimmedUrl = knowledgeUrl.trim();
    if (!knowledgeAttachSession) {
      setKnowledgeMessage('请先关联当前会话。');
      setKnowledgeError(true);
      return;
    }
    if (!activeSessionId) {
      setKnowledgeMessage('请先选择一个会话。');
      setKnowledgeError(true);
      return;
    }
    if (!trimmedUrl && !knowledgeFile) {
      setKnowledgeMessage('请提供链接或文件。');
      setKnowledgeError(true);
      return;
    }

    setKnowledgeLoading(true);
    try {
      const result = await knowledge.add({
        token,
        url: trimmedUrl || undefined,
        file: knowledgeFile,
        sessionId: activeSessionId
      });
      const payload = resolveProfile(result) || result;
      setKnowledgeMessage(payload?.message || result?.message || '知识已添加。');
      setKnowledgeError(false);
      setKnowledgeUrl('');
      setKnowledgeFile(null);
      setKnowledgeFileKey((prev) => prev + 1);
      await loadKnowledgeSources(activeSessionId);
    } catch (error) {
      handleAuthError(error);
      setKnowledgeMessage(error.message || '上传失败。');
      setKnowledgeError(true);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const knowledgeDisabled =
    !knowledgeAttachSession ||
    !activeSessionId ||
    knowledgeLoading ||
    (!knowledgeUrl.trim() && !knowledgeFile);

  useEffect(() => {
    if (!historyLoading) {
      scrollToBottom('auto');
    }
  }, [messages, historyLoading]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => () => stopTyping(), []);

  if (!authenticated) {
    return (
      <AuthPage
        authTab={authTab}
        authForm={authForm}
        authError={authError}
        onTabChange={setAuthTab}
        onFieldChange={handleAuthFieldChange}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="app">
      <AppHeader
        user={user}
        userMenuOpen={userMenuOpen}
        onUserMenuToggle={handleUserMenuToggle}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogoutClick}
        userMenuRef={userMenuRef}
      />
      <main className="layout">
        {!isMobile && (
          <SessionsPanel
            sessions={sessionsList}
            activeSessionId={activeSessionId}
            onCreate={handleCreateSession}
            onSelect={handleSelectSession}
            onRename={handleRenameSession}
            onDelete={handleDeleteSession}
          />
        )}
        <ChatPanel
          messages={messages}
          historyLoading={historyLoading}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSend={handleSend}
          chatError={chatError}
          isStreaming={isStreaming}
          ttsEnabled={ttsEnabled}
          onToggleTts={setTtsEnabled}
          messagesEndRef={messagesEndRef}
          onOpenSessions={isMobile ? handleToggleSessionsDrawer : null}
          onOpenKnowledge={isMobile ? handleToggleKnowledgeDrawer : null}
        />
        {!isMobile && (
          <KnowledgePanel
            knowledgeSources={knowledgeSources}
            knowledgeSourcesLoading={knowledgeSourcesLoading}
            knowledgeSourcesError={knowledgeSourcesError}
            knowledgeAttachSession={knowledgeAttachSession}
            onAttachChange={setKnowledgeAttachSession}
            knowledgeUrl={knowledgeUrl}
            onUrlChange={setKnowledgeUrl}
            knowledgeFileKey={knowledgeFileKey}
            onFileChange={setKnowledgeFile}
            knowledgeMessage={knowledgeMessage}
              knowledgeError={knowledgeError}
              knowledgeDisabled={knowledgeDisabled}
              knowledgeLoading={knowledgeLoading}
              activeSessionId={activeSessionId}
              onSubmit={handleKnowledgeSubmit}
          />
        )}
      </main>
      {isMobile && (
        <>
          <div
            className={`mobile-drawer-overlay ${
              sessionsDrawerOpen || knowledgeDrawerOpen ? 'open' : ''
            }`}
            onClick={handleCloseDrawers}
          />
          <div
            className={`mobile-drawer left ${sessionsDrawerOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="问过的事"
          >
            <SessionsPanel
              sessions={sessionsList}
              activeSessionId={activeSessionId}
              onCreate={handleCreateSession}
              onSelect={handleSelectSession}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
              onClose={handleCloseDrawers}
            />
          </div>
          <div
            className={`mobile-drawer right ${knowledgeDrawerOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="参考点什么"
          >
            <KnowledgePanel
              knowledgeSources={knowledgeSources}
              knowledgeSourcesLoading={knowledgeSourcesLoading}
              knowledgeSourcesError={knowledgeSourcesError}
              knowledgeAttachSession={knowledgeAttachSession}
              onAttachChange={setKnowledgeAttachSession}
              knowledgeUrl={knowledgeUrl}
              onUrlChange={setKnowledgeUrl}
              knowledgeFileKey={knowledgeFileKey}
              onFileChange={setKnowledgeFile}
              knowledgeMessage={knowledgeMessage}
              knowledgeError={knowledgeError}
              knowledgeDisabled={knowledgeDisabled}
              knowledgeLoading={knowledgeLoading}
              activeSessionId={activeSessionId}
              onSubmit={handleKnowledgeSubmit}
            />
          </div>
        </>
      )}
      {profileOpen && (
        <ProfileModal
          user={user}
          profileForm={profileForm}
          profileMessage={profileMessage}
          avatarFileKey={avatarFileKey}
          onClose={() => setProfileOpen(false)}
          onSubmit={handleProfileSubmit}
          onFieldChange={handleProfileFieldChange}
          onAvatarChange={handleAvatarChange}
        />
      )}
    </div>
  );
}
