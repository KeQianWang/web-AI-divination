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
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId);
  const loadHistory = useChatStore((state) => state.loadHistory);
  const loadKnowledgeSources = useChatStore((state) => state.loadKnowledgeSources);
  const clearKnowledgeSources = useChatStore((state) => state.clearKnowledgeSources);
  const stopTyping = useChatStore((state) => state.stopTyping);

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
    loadHistory(activeSessionId).catch(() => {});
  }, [token, activeSessionId, loadHistory]);

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
