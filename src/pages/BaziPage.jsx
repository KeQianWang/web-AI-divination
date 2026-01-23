import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chat } from '../api/client';
import useUserStore from '../store/useUserStore';
import './BaziPage.less';

const GUIDE_ITEMS = [
  {
    title: '天时落定，分秒有因',
    detail: '生辰八字以时辰为魂，年月日为骨。分秒之差，气数已别，务请如实填写。'
  },
  {
    title: '阴阳一念，不可错置',
    detail: '命盘以历法为根，阴阳一错，推演尽偏。请以出生记录为准，慎选阴历或阳历。'
  },
  {
    title: '心诚则灵，静则见象',
    detail: '测算之前，收敛杂念，专注所问。心有所应，卦象自明，结果方具参考之力。'
  }
];


const pad2 = (value) => String(value).padStart(2, '0');
const formatBirth = (year, month, day, hour, minute) =>
  `${year}-${pad2(month)}-${pad2(day)}-${pad2(hour)}点-${pad2(minute)}分`;

export default function BaziPage() {
  const token = useUserStore((state) => state.token);
  const nameRef = useRef(null);
  const now = new Date();
  const [calendarType, setCalendarType] = useState('solar');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [activeGuide, setActiveGuide] = useState(null);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= current - 100; y -= 1) {
      list.push(y);
    }
    return list;
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => index), []);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth]
  );

  useEffect(() => {
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [day, daysInMonth]);

  const handleToggleGuide = (index) => {
    setActiveGuide((current) => (current === index ? null : index));
  };

  const handleReset = () => {
    const fresh = new Date();
    setCalendarType('solar');
    setYear(fresh.getFullYear());
    setMonth(fresh.getMonth() + 1);
    setDay(fresh.getDate());
    setHour(fresh.getHours());
    setMinute(fresh.getMinutes());
    setName('');
    setGender('male');
    setSubmittedInfo(null);
    setResult('');
    setError('');
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const handleStart = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('请输入姓名后再开始测算。');
      return;
    }
    if (!token) {
      setError('请先登录后再开始测算。');
      return;
    }
    const calendarLabel = calendarType === 'solar' ? '阳历' : '阴历';
    const genderLabel = gender === 'male' ? '男' : '女';
    const birthText = formatBirth(year, month, day, hour, minute);
    setLoading(true);
    setError('');
    setResult('');
    setSubmittedInfo({
      name: trimmedName,
      gender: genderLabel,
      calendar: calendarLabel,
      birth: birthText
    });
    try {
      const data = await chat.send(token, {
        query: `八字测算:姓名:${trimmedName}，性别:${genderLabel}，历法:${calendarLabel}，出生日期:${birthText}`,
        enable_tts: false,
        async_mode: false,
        session_id: 'BaziPage'
      });
      const responseText = data?.msg || data?.content || data?.result || '';
      setResult(responseText || '命盘已成，但暂未解析出清晰内容，请稍后再试。');
    } catch (err) {
      setError(err?.message || '测算失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const showResult = Boolean(result);
  const calendarLabel = submittedInfo?.calendar || (calendarType === 'solar' ? '阳历' : '阴历');
  const genderLabel = submittedInfo?.gender || (gender === 'male' ? '男' : '女');
  const birthText = submittedInfo?.birth || formatBirth(year, month, day, hour, minute);

  return (
    <section className="page bazi-page">
      <div className="bazi-layout">
        <aside className="bazi-card bazi-principles">
          <div className="bazi-card-header">
            <h2>测算原则</h2>
          </div>
          <div className="bazi-principle-list">
            {GUIDE_ITEMS.map((item, index) => {
              const isActive = activeGuide === index;
              return (
                <div key={item.title} className={`bazi-principle-item ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="bazi-principle-title"
                    onClick={() => handleToggleGuide(index)}
                    aria-expanded={isActive}
                    aria-controls={`bazi-principle-detail-${index}`}
                  >
                    <span>{item.title}</span>
                    <span className="bazi-principle-toggle" aria-hidden="true" />
                  </button>
                  <div id={`bazi-principle-detail-${index}`} className="bazi-principle-detail">
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        {showResult ? (
          <div className="bazi-card bazi-result-card">
            <div className="bazi-result-section">
              <div className="bazi-result-title">基本信息</div>
              <div className="bazi-result-block">
                <div className="bazi-result-row">
                  <span>姓名</span>
                  <strong>{submittedInfo?.name || name}</strong>
                </div>
                <div className="bazi-result-row">
                  <span>性别</span>
                  <strong>{genderLabel}</strong>
                </div>
                <div className="bazi-result-row">
                  <span>历法</span>
                  <strong>{calendarLabel}</strong>
                </div>
                <div className="bazi-result-row">
                  <span>出生日期</span>
                  <strong>{birthText}</strong>
                </div>
              </div>
            </div>
            <div className="bazi-result-section" aria-live="polite">
              <div className="bazi-result-title">八字解读</div>
              <div className="bazi-result-block bazi-result-interpretation">
                <p className="bazi-result-text">{result}</p>
              </div>
            </div>
            <button type="button" className="primary bazi-action" onClick={handleReset} disabled={loading}>
              再来一次
            </button>
          </div>
        ) : (
          <div className="bazi-card ">
            <div className="bazi-card-header">
              <h2>出生信息</h2>
              <span>请依次填写</span>
            </div>
            <div className="bazi-form-body">
              <div className="bazi-field">
                <div className="bazi-segmented" role="group" aria-label="历法选择">
                  <button
                    type="button"
                    className={`bazi-segment ${calendarType === 'solar' ? 'active' : ''}`}
                    onClick={() => {
                      setCalendarType('solar');
                      setError('');
                    }}
                    disabled={loading}
                  >
                    阳历
                  </button>
                  <button
                    type="button"
                    className={`bazi-segment ${calendarType === 'lunar' ? 'active' : ''}`}
                    onClick={() => {
                      setCalendarType('lunar');
                      setError('');
                    }}
                    disabled={loading}
                  >
                    阴历
                  </button>
                </div>
              </div>
              <div className="bazi-field">
                <div className="bazi-date-grid">
                  <label className="bazi-select-field">
                    <span className="bazi-label">年</span>
                    <select
                      className="bazi-select"
                      value={year}
                      onChange={(event) => {
                        setYear(Number(event.target.value));
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {years.map((value) => (
                        <option key={value} value={value}>
                          {value}年
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="bazi-select-field">
                    <span className="bazi-label">月</span>
                    <select
                      className="bazi-select"
                      value={month}
                      onChange={(event) => {
                        setMonth(Number(event.target.value));
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {months.map((value) => (
                        <option key={value} value={value}>
                          {pad2(value)}月
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="bazi-select-field">
                    <span className="bazi-label">日</span>
                    <select
                      className="bazi-select"
                      value={day}
                      onChange={(event) => {
                        setDay(Number(event.target.value));
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {days.map((value) => (
                        <option key={value} value={value}>
                          {pad2(value)}日
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="bazi-select-field">
                    <span className="bazi-label">时</span>
                    <select
                      className="bazi-select"
                      value={hour}
                      onChange={(event) => {
                        setHour(Number(event.target.value));
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {hours.map((value) => (
                        <option key={value} value={value}>
                          {pad2(value)}点
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="bazi-select-field">
                    <span className="bazi-label">分</span>
                    <select
                      className="bazi-select"
                      value={minute}
                      onChange={(event) => {
                        setMinute(Number(event.target.value));
                        setError('');
                      }}
                      disabled={loading}
                    >
                      {minutes.map((value) => (
                        <option key={value} value={value}>
                          {pad2(value)}分
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="bazi-name-row">
                <div className="bazi-field">
                  <label className="bazi-label" htmlFor="bazi-name">
                    姓名
                  </label>
                  <input
                    ref={nameRef}
                    id="bazi-name"
                    className="bazi-input"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError('');
                    }}
                    placeholder="请输入您的姓名"
                    disabled={loading}
                  />
                </div>
                <div className="bazi-field">
                  <span className="bazi-label">性别</span>
                  <div className="bazi-segmented" role="group" aria-label="性别选择">
                    <button
                      type="button"
                      className={`bazi-segment ${gender === 'male' ? 'active' : ''}`}
                      onClick={() => {
                        setGender('male');
                        setError('');
                      }}
                      disabled={loading}
                    >
                      男
                    </button>
                    <button
                      type="button"
                      className={`bazi-segment ${gender === 'female' ? 'active' : ''}`}
                      onClick={() => {
                        setGender('female');
                        setError('');
                      }}
                      disabled={loading}
                    >
                      女
                    </button>
                  </div>
                </div>
              </div>
              {error && <div className="bazi-error">{error}</div>}
              <button type="button" className="primary bazi-action" onClick={handleStart} disabled={loading}>
                {loading ? '测算进行中…' : '开始测算'}
              </button>
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div className="bazi-overlay" role="status" aria-live="polite">
          <img src="/yinyang.png" alt="测算中" className="bazi-spinner" />
        </div>
      )}
    </section>
  );
}
