import React from 'react';
import useAppNavigation from '../hooks/useAppNavigation';
import { HOME_CARDS } from '../router/routes';

export default function HomePage() {
  const { goTo } = useAppNavigation();

  return (
    <section className="page home-page">
      <div className="home-hero">
        <h1>欢迎回来</h1>
        <p>选一张卡片，开始今天的占问之旅。</p>
      </div>
      <div className="card-grid">
        {HOME_CARDS.map((card) => (
          <button
            key={card.key}
            type="button"
            className="feature-card"
            onClick={() => goTo(card.path)}
          >
            <div className="feature-title">{card.title}</div>
            <div className="feature-subtitle">{card.subtitle}</div>
            <span className="feature-action">立即进入</span>
          </button>
        ))}
      </div>
    </section>
  );
}
