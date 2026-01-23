import React, { useRef, useState } from 'react';
import { chat } from '../api/client';
import useUserStore from '../store/useUserStore';
import './DreamPage.less';

const GUIDE_ITEMS = [
  {
    title: '一梦一象，皆有所指',
    detail: '梦非虚妄，所见之人、物、境，皆为潜识借象而显。'
  },
  {
    title: '梦随时转，应随境生',
    detail: '做梦之时，映照当下气机与因缘，时间越明，解读越准。'
  },
  {
    title: '心定而后解，意现而后知',
    detail: '缓下心绪，抓住梦中最强烈之感，其象自会开口。'
  }
];


const TIME_OPTIONS = [
  { label: '昨天晚上', value: 'lastNight' },
  { label: '本周内', value: 'thisWeek' },
  { label: '太久了', value: 'longAgo' }
];

export default function DreamPage() {
  const token = useUserStore((state) => state.token);
  const contentRef = useRef(null);
  const [activeGuide, setActiveGuide] = useState(null);
  const [content, setContent] = useState('');
  const [timeOption, setTimeOption] = useState(TIME_OPTIONS[0].value);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleGuide = (index) => {
    setActiveGuide((current) => (current === index ? null : index));
  };

  const handleStart = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('请输入梦境内容后再开始解梦。');
      setResult('');
      return;
    }
    if (!token) {
      setError('请先登录后再开始解梦。');
      setResult('');
      return;
    }
    const timeLabel = TIME_OPTIONS.find((item) => item.value === timeOption)?.label || '';
    setLoading(true);
    setError('');
    setResult('');
    setSubmittedInfo({
      content: trimmed,
      timeLabel
    });
    try {
      const data = await chat.send(token, {
        query: `我想要解梦,梦境内容:${trimmed};做梦时间:${timeLabel}`,
        enable_tts: false,
        async_mode: false,
        session_id: 'DreamPage'
      });
      const responseText = data?.msg || data?.content || data?.result || '';
      setResult(responseText || '梦境已成，但暂未解析出清晰内容，请稍后再试。');
    } catch (err) {
      setError(err?.message || '解梦失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setTimeOption(TIME_OPTIONS[0].value);
    setSubmittedInfo(null);
    setResult('');
    setError('');
    requestAnimationFrame(() => contentRef.current?.focus());
  };

  const showResult = Boolean(result);
  const timeLabel =
    submittedInfo?.timeLabel || TIME_OPTIONS.find((item) => item.value === timeOption)?.label || '';
  const contentValue = submittedInfo?.content || content;

  return (
    <section className="page dream-page">
      <div className="dream-shell">
        <div className="dream-layout">
        <aside className="dream-card dream-principles">
          <div className="dream-card-header">
            <h2>解梦提示</h2>
          </div>
          <div className="dream-principle-list">
            {GUIDE_ITEMS.map((item, index) => {
              const isActive = activeGuide === index;
              return (
                <div key={item.title} className={`dream-principle-item ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="dream-principle-title"
                    onClick={() => handleToggleGuide(index)}
                    aria-expanded={isActive}
                    aria-controls={`dream-principle-detail-${index}`}
                  >
                    <span>{item.title}</span>
                    <span className="dream-principle-toggle" aria-hidden="true" />
                  </button>
                  <div id={`dream-principle-detail-${index}`} className="dream-principle-detail">
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        {showResult ? (
          <div className="dream-card dream-result-card">
            <div className="dream-result-section">
              <div className="dream-result-title">梦境内容</div>
              <div className="dream-result-block">
                <p className="dream-result-text">{contentValue}</p>
              </div>
            </div>
            <div className="dream-result-section">
              <div className="dream-result-title">做梦时间</div>
              <div className="dream-result-block">
                <p className="dream-result-text">{timeLabel}</p>
              </div>
            </div>
            <div className="dream-result-section" aria-live="polite">
              <div className="dream-result-title">梦境解读</div>
              <div className="dream-result-block dream-result-interpretation">
                <p className="dream-result-text">{result}</p>
              </div>
            </div>
            <button type="button" className="primary dream-action" onClick={handleReset} disabled={loading}>
              再解一次
            </button>
          </div>
        ) : (
          <div className="dream-card dream-form">
            <div className="dream-card-header">
              <h2>梦境内容</h2>
              <span>尽量描述清晰</span>
            </div>
            <div className="dream-form-body">
              <div className="dream-field">
                <textarea
                  ref={contentRef}
                  id="dream-content"
                  className="dream-textarea"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="例如：梦见自己在飞，或被追赶、考试迟到等..."
                  disabled={loading}
                  rows={5}
                />
              </div>
              <div className="dream-field">
                <span className="dream-label">做梦时间</span>
                <div className="dream-segmented" role="group" aria-label="做梦时间">
                  {TIME_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`dream-segment ${timeOption === item.value ? 'active' : ''}`}
                      onClick={() => {
                        setTimeOption(item.value);
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="dream-error">{error}</div>}
              <button type="button" className="primary dream-action" onClick={handleStart} disabled={loading}>
                {loading ? '解梦进行中…' : '开始解梦'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      {loading && (
        <div className="dream-overlay" role="status" aria-live="polite">
          <img src="/yinyang.png" alt="解梦中" className="dream-spinner" />
        </div>
      )}
    </section>
  );
}
