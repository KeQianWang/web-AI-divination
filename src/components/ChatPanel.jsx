import React, { useEffect, useRef } from 'react';
import { formatMessageTime, resolveAudioUrl, resolveMoodEmoji } from '../utils/formatters';
import useChatStore from '../store/useChatStore';
import './ChatPanel.less';

export default function ChatPanel({ onOpenSessions, onOpenKnowledge }) {
  const messages = useChatStore((state) => state.messages);
  const historyLoading = useChatStore((state) => state.historyLoading);
  const chatInput = useChatStore((state) => state.chatInput);
  const setChatInput = useChatStore((state) => state.setChatInput);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const chatError = useChatStore((state) => state.chatError);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const ttsEnabled = useChatStore((state) => state.ttsEnabled);
  const setTtsEnabled = useChatStore((state) => state.setTtsEnabled);
  const messagesEndRef = useRef(null);
  const hasMobileActions = Boolean(onOpenSessions || onOpenKnowledge);

  useEffect(() => {
    if (historyLoading) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages, historyLoading]);

  return (
    <section className="panel chat-panel">
      <div className="panel-header">
        {hasMobileActions ? (
          <div className="chat-header-row">
            <h2>在听你说:</h2>
            <div className="chat-header-actions">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(event) => setTtsEnabled(event.target.checked)}
                />
                <span>开启语音合成</span>
              </label>
              <div className="chat-mobile-actions">
                {onOpenSessions && (
                  <button
                    type="button"
                    className="chat-icon-button"
                    aria-label="打开问过的事"
                    onClick={onOpenSessions}
                  >
                    <img src="/history.png" alt="" aria-hidden="true" />
                  </button>
                )}
                {onOpenKnowledge && (
                  <button
                    type="button"
                    className="chat-icon-button"
                    aria-label="打开参考点什么"
                    onClick={onOpenKnowledge}
                  >
                    <img src="/knowledge.png" alt="" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2>在听你说:</h2>
            <label className="toggle">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(event) => setTtsEnabled(event.target.checked)}
              />
              <span>开启语音合成</span>
            </label>
          </>
        )}
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
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="说吧，你想问什么..."
              rows={2}
              onKeyDown={(event) => {
                if (event.isComposing) return;
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (isStreaming) return;
                  const text = event.currentTarget.value;
                  if (!text.trim()) return;
                  sendMessage(text);
                }
              }}
            />
            <button type="button" className="primary" onClick={() => sendMessage()}>
              {isStreaming ? '发送中...' : '发送'}
            </button>
          </div>
          {chatError && <div className="form-hint error">{chatError}</div>}
        </div>
      </div>
    </section>
  );
}
