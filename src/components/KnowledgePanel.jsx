import React from 'react';

export default function KnowledgePanel({
  knowledgeSources,
  knowledgeSourcesLoading,
  knowledgeSourcesError,
  knowledgeAttachSession,
  onAttachChange,
  knowledgeUrl,
  onUrlChange,
  knowledgeFileKey,
  onFileChange,
  knowledgeMessage,
  knowledgeError,
  knowledgeDisabled,
  knowledgeLoading,
  activeSessionId,
  onSubmit
}) {
  return (
    <aside className="panel profile-panel">
      <div className="knowledge">
        <div className="knowledge-header">
          <h3>参考点什么</h3>
          <label className="toggle">
            <input
              type="checkbox"
              checked={knowledgeAttachSession}
              onChange={(event) => onAttachChange(event.target.checked)}
            />
            <span>关联当前会话</span>
          </label>
        </div>
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
            <div className="empty">暂无知识库内容。</div>
          )}
        </div>
        <form className="knowledge-form" onSubmit={onSubmit}>
          <label>
            链接
            <input
              value={knowledgeUrl}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder="https://example.com/article"
            />
          </label>
          <label>
            文件
            <input
              key={knowledgeFileKey}
              type="file"
              onChange={(event) => onFileChange(event.target.files?.[0] || null)}
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
    </aside>
  );
}
