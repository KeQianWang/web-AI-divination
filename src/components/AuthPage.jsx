import React from 'react';

export default function AuthPage({
  authTab,
  authForm,
  authError,
  onTabChange,
  onFieldChange,
  onSubmit
}) {
  const handleFieldChange = (field) => (event) => onFieldChange(field, event.target.value);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-title">
            <img src="/hero.png" alt="" aria-hidden="true" />
            <h1>信我吗?</h1>
          </div>
          <p>我只负责算，不负责安慰。</p>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={authTab === 'login' ? 'active' : ''}
            onClick={() => onTabChange('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={authTab === 'register' ? 'active' : ''}
            onClick={() => onTabChange('register')}
          >
            注册
          </button>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            用户名
            <input
              value={authForm.username}
              onChange={handleFieldChange('username')}
              placeholder="请输入用户名"
              required
            />
          </label>
          <label>
            密码
            <input
              type="password"
              value={authForm.password}
              onChange={handleFieldChange('password')}
              placeholder="请输入密码"
              required
            />
          </label>
          {authTab === 'register' && (
            <label>
              手机号
              <input
                value={authForm.phone}
                onChange={handleFieldChange('phone')}
                placeholder="请输入手机号"
                required
              />
            </label>
          )}
          {authError && <div className="form-hint error">{authError}</div>}
          <button type="submit" className="primary">
            {authTab === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  );
}
