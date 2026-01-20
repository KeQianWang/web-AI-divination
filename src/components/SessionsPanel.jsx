import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatMessageTime } from '../utils/formatters';
import { getSessionId } from '../utils/resolve';
import useChatStore from '../store/useChatStore';

export default function SessionsPanel({ onClose }) {
  const sessions = useChatStore((state) => state.sessionsList);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const createSession = useChatStore((state) => state.createSession);
  const selectSession = useChatStore((state) => state.setActiveSessionId);
  const loadHistory = useChatStore((state) => state.loadHistory);
  const renameSession = useChatStore((state) => state.renameSession);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const [openMenu, setOpenMenu] = useState(null);
  const openMenuSessionId = openMenu?.sessionId ?? null;

  const clearMenuPosition = () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.removeProperty('--session-menu-top');
    root.style.removeProperty('--session-menu-left');
  };

  const setMenuPosition = (top, left) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--session-menu-top', `${Math.round(top)}px`);
    root.style.setProperty('--session-menu-left', `${Math.round(left)}px`);
  };

  useEffect(() => {
    if (!openMenu) {
      clearMenuPosition();
      return;
    }

    setMenuPosition(openMenu.top, openMenu.left);

    return () => {
      clearMenuPosition();
    };
  }, [openMenu]);

  useEffect(() => {
    if (!openMenuSessionId) return;

    const handleClick = (event) => {
      if (!event.target.closest(`[data-session-menu="${openMenuSessionId}"]`)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    const handleScroll = () => {
      setOpenMenu(null);
    };

    const handleResize = () => {
      setOpenMenu(null);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [openMenuSessionId]);

  return (
    <aside className="panel sessions-panel">
      <div className="panel-header">
        <h3>问过的事</h3>
        <div className="panel-actions">
          <button type="button" className="primary" onClick={createSession}>
            再问一卦
          </button>
        </div>
      </div>
      <div className="panel-body">
        <div className="session-list">
          {sessions.map((session) => {
            const sessionId = getSessionId(session);
            const isMenuOpen = openMenuSessionId === sessionId;
            return (
              <div
                key={sessionId}
                className={`session-item ${sessionId === activeSessionId ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="session-main"
                  onClick={() => {
                    if (sessionId === activeSessionId) {
                      loadHistory(sessionId);
                    } else {
                      selectSession(sessionId);
                    }
                    onClose?.();
                  }}
                >
                  <div className="session-title">{session.title || '未命名会话'}</div>
                  <div className="session-meta">
                    {formatMessageTime(session.updated_at || session.updatedAt)}
                  </div>
                </button>
                <div
                  className={`session-actions ${isMenuOpen ? 'open' : ''}`}
                  data-session-menu={sessionId}
                >
                  <button
                    type="button"
                    className="session-menu-trigger"
                    aria-label="会话操作"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (openMenuSessionId === sessionId) {
                        clearMenuPosition();
                        setOpenMenu(null);
                        return;
                      }
                      const triggerRect = event.currentTarget.getBoundingClientRect();
                      const estimatedMenuHeight = 96;
                      const shouldOpenUp =
                        triggerRect.bottom + estimatedMenuHeight > window.innerHeight;
                      const top = shouldOpenUp ? triggerRect.top - 6 : triggerRect.bottom + 6;
                      const left = triggerRect.right;
                      setMenuPosition(top, left);
                      setOpenMenu({
                        sessionId,
                        direction: shouldOpenUp ? 'up' : 'down',
                        top,
                        left
                      });
                    }}
                  >
                    <img src="/more.png" alt="" aria-hidden="true" />
                  </button>
                  {isMenuOpen && (
                    createPortal(
                      <div
                        className={`session-menu ${openMenu?.direction === 'up' ? 'up' : 'down'}`}
                        role="menu"
                        data-session-menu={sessionId}
                      >
                        <button
                          type="button"
                          className="session-menu-item"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null);
                            const nextTitle = window.prompt('重命名会话', session.title || '');
                            if (nextTitle === null) return;
                            const trimmed = nextTitle.trim();
                            if (!trimmed) return;
                            renameSession(sessionId, trimmed);
                          }}
                        >
                          <img src="/rename.png" alt="" aria-hidden="true" />
                          重命名
                        </button>
                        <button
                          type="button"
                          className="session-menu-item danger"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null);
                            if (!window.confirm('确认删除该会话？')) return;
                            deleteSession(sessionId);
                          }}
                        >
                          <img src="/delete.png" alt="" aria-hidden="true" />
                          删除
                        </button>
                      </div>,
                      document.body
                    )
                  )}
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && <div className="empty">这里啥都没有。</div>}
        </div>
      </div>
    </aside>
  );
}
