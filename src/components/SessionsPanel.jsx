import React from 'react';
import { formatMessageTime } from '../utils/formatters';
import { getSessionId } from '../utils/resolve';

export default function SessionsPanel({
  sessions,
  activeSessionId,
  onCreate,
  onSelect,
  onRename,
  onDelete
}) {
  return (
    <aside className="panel sessions-panel">
      <div className="panel-header">
        <h2>问过的事</h2>
        <button type="button" className="primary" onClick={onCreate}>
            再问一卦
        </button>
      </div>
      <div className="session-list">
        {sessions.map((session) => {
          const sessionId = getSessionId(session);
          return (
            <div
              key={sessionId}
              className={`session-item ${sessionId === activeSessionId ? 'active' : ''}`}
            >
              <button
                type="button"
                className="session-main"
                onClick={() => onSelect(sessionId)}
              >
                <div className="session-title">{session.title || '未命名会话'}</div>
                <div className="session-meta">
                  {(sessionId ? sessionId.slice(0, 8) : '--')} ·{' '}
                  {formatMessageTime(session.updated_at || session.updatedAt)}
                </div>
              </button>
              <div className="session-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onRename(sessionId, session.title)}
                >
                  重命名
                </button>
                <button
                  type="button"
                  className="ghost danger"
                  onClick={() => onDelete(sessionId)}
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
        {sessions.length === 0 && <div className="empty">暂无会话，先创建一个吧。</div>}
      </div>
    </aside>
  );
}
