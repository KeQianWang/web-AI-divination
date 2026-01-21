import React from 'react';
import useAppNavigation from '../hooks/useAppNavigation';
import { HOME_CARDS } from '../router/routes';

export default function HomePage() {
  const { goTo } = useAppNavigation();
  const cardsByKey = HOME_CARDS.reduce((acc, card) => {
    acc[card.key] = card;
    return acc;
  }, {});
  const { daily, bazi, dream, chat } = cardsByKey;

  return (
    <section className="page home-page">
      <div className="home-shell">
        <div className="home-bento">
          <div className="lunar-card">
            <div className="lunar-header">
              <div className="lunar-date">
                <span className="lunar-date-main">2024.10.12</span>
                <span className="lunar-date-sub">农历八月初十 · 甲辰年</span>
              </div>
              <span className="lunar-week">周六</span>
            </div>
            <div className="lunar-row">
              <span className="lunar-row-label">干支 · 星宿</span>
              <span className="lunar-row-value">甲辰年 甲戌月 辛丑日 · 虚宿</span>
            </div>
            <div className="lunar-row">
              <span className="lunar-row-label">宜 / 忌</span>
              <span className="lunar-row-value">静心、读书、整理 ｜ 远行、争执</span>
            </div>
            <div className="lunar-note">今日简评：宜静不宜动</div>
          </div>
          <div className="feature-grid">
            <button
              type="button"
              className="feature-card feature-card--daily"
              onClick={() => goTo(daily.path)}
            >
              <div className="feature-card-content">
                <div className="feature-title">{daily.title}</div>
                <div className="feature-subtitle">{daily.subtitle}</div>
              </div>
              <span className="feature-icon feature-icon--daily" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="feature-card feature-card--bazi"
              onClick={() => goTo(bazi.path)}
            >
              <div className="feature-card-content">
                <div className="feature-title">{bazi.title}</div>
                <div className="feature-subtitle">{bazi.subtitle}</div>
              </div>
              <span className="feature-icon feature-icon--bazi" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="feature-card feature-card--dream"
              onClick={() => goTo(dream.path)}
            >
              <div className="feature-card-content">
                <div className="feature-title">{dream.title}</div>
                <div className="feature-subtitle">{dream.subtitle}</div>
              </div>
              <span className="feature-icon feature-icon--dream" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="feature-card feature-card--chat"
              onClick={() => goTo(chat.path)}
            >
              <div className="feature-card-content">
                <div className="feature-title">{chat.title}</div>
                <div className="feature-subtitle">{chat.subtitle}</div>
              </div>
              <span className="feature-icon feature-icon--chat" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
