import React, { useEffect, useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import KnowledgePanel from '../components/KnowledgePanel';
import SessionsPanel from '../components/SessionsPanel';
import useChatStore from '../store/useChatStore';
import useUserStore from '../store/useUserStore';
import { getSessionId } from '../utils/resolve';
import './ChatPage.less';

export default function ChatPage() {
  const token = useUserStore((state) => state.token);
  const bootstrapped = useChatStore((state) => state.bootstrapped);
  const bootstrap = useChatStore((state) => state.bootstrap);
  const sessionsList = useChatStore((state) => state.sessionsList);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const messagesSessionId = useChatStore((state) => state.messagesSessionId);
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId);
  const loadHistory = useChatStore((state) => state.loadHistory);
  const loadKnowledgeSources = useChatStore((state) => state.loadKnowledgeSources);
  const clearKnowledgeSources = useChatStore((state) => state.clearKnowledgeSources);
  const stopTyping = useChatStore((state) => state.stopTyping);
  const pendingContext = useChatStore((state) => state.pendingContext);
  const setPendingContext = useChatStore((state) => state.setPendingContext);
  const setChatInput = useChatStore((state) => state.setChatInput);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 900;
  });
  const [sessionsDrawerOpen, setSessionsDrawerOpen] = useState(false);
  const [knowledgeDrawerOpen, setKnowledgeDrawerOpen] = useState(false);

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

  useEffect(() => {
    if (!token || bootstrapped) return;
    bootstrap().catch(() => {});
  }, [token, bootstrapped, bootstrap]);

  useEffect(() => {
    if (!token || !activeSessionId) return;
    if (messagesSessionId === activeSessionId) return;
    loadHistory(activeSessionId).catch(() => {});
  }, [token, activeSessionId, messagesSessionId, loadHistory]);

  useEffect(() => {
    if (!activeSessionId) {
      clearKnowledgeSources();
      return;
    }
    loadKnowledgeSources(activeSessionId).catch(() => {});
  }, [activeSessionId, clearKnowledgeSources, loadKnowledgeSources]);

  useEffect(() => {
    if (!activeSessionId && sessionsList.length > 0) {
      setActiveSessionId(getSessionId(sessionsList[0]));
    }
  }, [sessionsList, activeSessionId, setActiveSessionId]);

  useEffect(() => {
    if (pendingContext && token) {
      // 如果有待处理的上下文，自动填充到输入框或者直接发送
      // 这里我们选择填充到输入框让用户确认，或者直接作为新会话的开场白
      // 为了更好的体验，我们可以创建一个新会话（如果当前没有特定会话）并带入上下文
      
      const { content, type } = pendingContext;
      const contextPrefix = `【${type}续问】\n前情提要：${content}\n\n我的疑问是：`;
      
      setChatInput(contextPrefix);
      
      // 清除 pendingContext 以免重复触发
      setPendingContext(null);
    }
  }, [pendingContext, token, setChatInput, setPendingContext]);

  useEffect(() => () => stopTyping(), [stopTyping]);

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

  return (
    <section className="page chat-page">
      <div className="layout">
        {!isMobile && <SessionsPanel />}
        <ChatPanel
          onOpenSessions={isMobile ? handleToggleSessionsDrawer : null}
          onOpenKnowledge={isMobile ? handleToggleKnowledgeDrawer : null}
        />
        {!isMobile && <KnowledgePanel />}
      </div>
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
            <SessionsPanel onClose={handleCloseDrawers} />
          </div>
          <div
            className={`mobile-drawer right ${knowledgeDrawerOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="参考点什么"
          >
            <KnowledgePanel />
          </div>
        </>
      )}
    </section>
  );
}
