import React, { useRef, useState } from 'react';
import { chat } from '../api/client';
import useUserStore from '../store/useUserStore';
import './DailyPage.less';

const PRINCIPLES = [
  {
    title: '有疑则卜，无疑不占',
    detail: '只有在心中存在疑问或困惑时才进行卜卦；如果心中没有疑问，则不应随意卜卦。'
  },
  {
    title: '一事一占，勿再复卜',
    detail: '对于同一件事，只进行一次卜卦，不应在短时间内多次占卜同一问题，以免影响结果的准确性。'
  },
  {
    title: '非时非地，不敬不占',
    detail: '避免在深夜、卧室、厕所等环境下卜卦，且卜卦前应净手，保持身心清净。'
  },
  {
    title: '心诚则灵，不义不卜',
    detail: '卜卦时应保持诚心和专注。对于不合乎正当性及合理性的问题，不应进行卜卦。'
  }
];

const HOT_QUESTIONS = [
  '今天运势如何？',
  '今天适合买彩票吗？',
  '事业发展',
  '感情状况',
  '近期有财运机会吗？'
];

export default function DailyPage() {
  const token = useUserStore((state) => state.token);
  const inputRef = useRef(null);
  const [activePrinciple, setActivePrinciple] = useState(null);
  const [question, setQuestion] = useState('');
  const [askedQuestion, setAskedQuestion] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTogglePrinciple = (index) => {
    setActivePrinciple((current) => (current === index ? null : index));
  };

  const handlePickHot = (value) => {
    setQuestion(value);
    setError('');
    inputRef.current?.focus();
  };

  const handleStart = async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      setError('请输入所问之事后再开始卜卦。');
      setResult('');
      return;
    }
    if (!token) {
      setError('请先登录后再开始卜卦。');
      setResult('');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setAskedQuestion(trimmed);
    try {
      const data = await chat.send(token, {
        query: '来一卦:'+trimmed,
        enable_tts: false,
        async_mode: false,
        session_id: 'DailyPage'
      });
      const responseText = data?.msg || data?.content || data?.result || '';
      setResult(responseText || '卦象已成，但暂未解析出清晰内容，请稍后再试。');
    } catch (err) {
      setError(err?.message || '卜卦失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setQuestion('');
    setAskedQuestion('');
    setResult('');
    setError('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const showResult = Boolean(result);

  return (
    <section className="page daily-page">
      <div className="daily-layout">
        <aside className="daily-card daily-principles">
          <div className="daily-card-header">
            <h2>卜卦原则</h2>
          </div>
          <div className="principle-list">
            {PRINCIPLES.map((item, index) => {
              const isActive = activePrinciple === index;
              return (
                <div key={item.title} className={`principle-item ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="principle-title"
                    onClick={() => handleTogglePrinciple(index)}
                    aria-expanded={isActive}
                    aria-controls={`principle-detail-${index}`}
                  >
                    <span>{item.title}</span>
                    <span className="principle-toggle" aria-hidden="true" />
                  </button>
                  <div id={`principle-detail-${index}`} className="principle-detail">
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        {showResult ? (
          <div className="daily-card daily-result-card">
            <div className="daily-result-section">
              <div className="daily-result-title">所问之事</div>
              <div className="daily-result-block">
                <p className="daily-result-question">{askedQuestion || question}</p>
              </div>
            </div>
            <div className="daily-result-section" aria-live="polite">
              <div className="daily-result-title">卦象解读</div>
              <div className="daily-result-block daily-result-interpretation">
                <p className="daily-result-text">{result}</p>
              </div>
            </div>
            <button
              type="button"
              className="primary daily-action daily-retry"
              onClick={handleRetry}
              disabled={loading}
            >
              再来一卦
            </button>
          </div>
        ) : (
          <div className="daily-card daily-consult">
            <div className="daily-card-header">
              <h2>今日所问</h2>
              <span>一事一占，专注当下</span>
            </div>
            <div className="daily-consult-body">
              <textarea
                ref={inputRef}
                id="daily-question"
                className="daily-input"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="请输入所问之事，心中默念三遍后开始卜卦"
                disabled={loading}
                rows={4}
              />
              <div className="daily-hot">
                <span className="daily-hot-label">热门问卦</span>
                <div className="daily-hot-list">
                  {HOT_QUESTIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="daily-hot-item"
                      onClick={() => handlePickHot(item)}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="daily-error">{error}</div>}
              <button type="button" className="primary daily-action" onClick={handleStart} disabled={loading}>
                {loading ? '卜卦进行中…' : '开始卜卦'}
              </button>
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div className="daily-overlay" role="status" aria-live="polite">
          <img src="/yinyang.png" alt="卜卦中" className="daily-spinner" />
        </div>
      )}
    </section>
  );
}
