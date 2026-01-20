import React from 'react';
import { formatMessageTime, resolveAudioUrl, resolveMoodEmoji } from '../utils/formatters';

export default function ChatPanel({
  messages,
  historyLoading,
  chatInput,
  onChatInputChange,
  onSend,
  chatError,
  isStreaming,
  ttsEnabled,
  onToggleTts,
  messagesEndRef
}) {
  return (
    <section className="panel chat-panel">
      <div className="panel-header">
        <h2>在听你说:</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(event) => onToggleTts(event.target.checked)}
          />
          <span>开启语音合成</span>
        </label>
      </div>
      <div className="chat-body">
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="message-bubble">
                <div className="message-content">
                  {message.content ? (
                    message.content
                  ) : message.streaming ? (
                    <span className="typing-dots" aria-label="加载中">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    ''
                  )}
                </div>
                <div className="message-meta">
                  {message.role === 'assistant' && message.mood && (
                    <span className="tag">{resolveMoodEmoji(message.mood)}</span>
                  )}
                  {message.createdAt && <span>{formatMessageTime(message.createdAt)}</span>}
                </div>
                {message.audioUrl && <audio controls src={resolveAudioUrl(message.audioUrl)} />}
              </div>
            </div>
          ))}
          {historyLoading ? (
            <div className="empty">历史记录加载中...</div>
          ) : (
            messages.length === 0 && <div className="empty">所问之事心中默念三遍，方显诚心。</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="composer">
          <div className="composer-row">
            <textarea
              value={chatInput}
              onChange={(event) => onChatInputChange(event.target.value)}
              placeholder="说吧，你想问什么..."
              rows={2}
              onKeyDown={(event) => {
                if (event.isComposing) return;
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (isStreaming) return;
                  const text = event.currentTarget.value;
                  if (!text.trim()) return;
                  onSend(text);
                }
              }}
            />
            <button type="button" className="primary" onClick={() => onSend()}>
              {isStreaming ? '发送中...' : '发送'}
            </button>
          </div>
          {chatError && <div className="form-hint error">{chatError}</div>}
        </div>
      </div>
    </section>
  );
}
