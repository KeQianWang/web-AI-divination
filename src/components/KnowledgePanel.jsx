import React from 'react';
import useChatStore from '../store/useChatStore';
import './KnowledgePanel.less';

export default function KnowledgePanel() {
  const knowledgeSources = useChatStore((state) => state.knowledgeSources);
  const knowledgeSourcesLoading = useChatStore((state) => state.knowledgeSourcesLoading);
  const knowledgeSourcesError = useChatStore((state) => state.knowledgeSourcesError);
  const knowledgeAttachSession = useChatStore((state) => state.knowledgeAttachSession);
  const setKnowledgeAttachSession = useChatStore((state) => state.setKnowledgeAttachSession);
  const knowledgeUrl = useChatStore((state) => state.knowledgeUrl);
  const setKnowledgeUrl = useChatStore((state) => state.setKnowledgeUrl);
  const knowledgeFileKey = useChatStore((state) => state.knowledgeFileKey);
  const setKnowledgeFile = useChatStore((state) => state.setKnowledgeFile);
  const knowledgeMessage = useChatStore((state) => state.knowledgeMessage);
  const knowledgeError = useChatStore((state) => state.knowledgeError);
  const knowledgeLoading = useChatStore((state) => state.knowledgeLoading);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const submitKnowledge = useChatStore((state) => state.submitKnowledge);
  const knowledgeFile = useChatStore((state) => state.knowledgeFile);

  const knowledgeDisabled =
    !knowledgeAttachSession ||
    !activeSessionId ||
    knowledgeLoading ||
    (!knowledgeUrl.trim() && !knowledgeFile);

  return (
    <aside className="panel profile-panel">
      <div className="knowledge">
        <div className="knowledge-header">
          <h3>参考点什么</h3>
          <div className="panel-actions">
            <label className="toggle">
              <input
                type="checkbox"
                checked={knowledgeAttachSession}
                onChange={(event) => setKnowledgeAttachSession(event.target.checked)}
              />
              <span>关联当前会话</span>
            </label>
          </div>
        </div>
        <div className="panel-body">
          <div className="knowledge-sources">
            {knowledgeSourcesLoading ? (
              <div className="empty">加载中...</div>
            ) : knowledgeSourcesError ? (
              <div className="form-hint error">{knowledgeSourcesError}</div>
            ) : knowledgeSources.length > 0 ? (
              <ul className="knowledge-list">
                {knowledgeSources.map((source, index) => (
                  <li key={`${source}-${index}`}>
                    {source?.startsWith?.('http') ? (
                      <a href={source} target="_blank" rel="noreferrer">
                        {source}
                      </a>
                    ) : (
                      <span>{source}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">这里啥都没有。</div>
            )}
          </div>
          <form
            className="knowledge-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitKnowledge();
            }}
          >
            <label>
              链接
              <input
                value={knowledgeUrl}
                onChange={(event) => setKnowledgeUrl(event.target.value)}
                placeholder="https://example.com/article"
              />
            </label>
            <label>
              文件
              <input
                key={knowledgeFileKey}
                type="file"
                onChange={(event) => setKnowledgeFile(event.target.files?.[0] || null)}
              />
            </label>
            <div className="form-hint">
              {knowledgeAttachSession && activeSessionId
                ? `会话：${activeSessionId.slice(0, 8)}`
                : '未选择当前会话。'}
            </div>
            {knowledgeMessage && (
              <div className={`form-hint ${knowledgeError ? 'error' : ''}`}>
                {knowledgeMessage}
              </div>
            )}
            <button type="submit" className="primary" disabled={knowledgeDisabled}>
              {knowledgeLoading ? '上传中...' : '算的时候用得上'}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
