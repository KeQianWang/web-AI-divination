import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { ROUTES } from '../router/routes';

const emptyAuthForm = {
  username: '',
  password: '',
  phone: ''
};

export default function AuthPage() {
  const navigate = useNavigate();
  const token = useUserStore((state) => state.token);
  const login = useUserStore((state) => state.login);
  const register = useUserStore((state) => state.register);
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      navigate(ROUTES.home.path, { replace: true });
    }
  }, [token, navigate]);

  const handleFieldChange = (field) => (event) => {
    setAuthForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    try {
      if (authTab === 'login') {
        await login({
          username: authForm.username,
          password: authForm.password
        });
        navigate(ROUTES.home.path, { replace: true });
      } else {
        await register({
          username: authForm.username,
          password: authForm.password,
          phone: authForm.phone
        });
        setAuthTab('login');
        setAuthError('注册成功，请登录。');
      }
    } catch (error) {
      setAuthError(error.message || '请求失败。');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-title">
            <img src="/hero.png" alt="" aria-hidden="true" />
            <h1>信我么</h1>
          </div>
          <p>我只负责算，不负责安慰。</p>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={authTab === 'login' ? 'active' : ''}
            onClick={() => setAuthTab('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={authTab === 'register' ? 'active' : ''}
            onClick={() => setAuthTab('register')}
          >
            注册
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
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
