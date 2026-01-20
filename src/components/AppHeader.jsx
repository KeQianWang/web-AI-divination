import React, { useEffect, useRef, useState } from 'react';
import useAppNavigation from '../hooks/useAppNavigation';
import useAppStore from '../store/useAppStore';
import useChatStore from '../store/useChatStore';
import useUserStore from '../store/useUserStore';
import { resolveAvatarSrc } from '../utils/formatters';
import ProfileModal from './ProfileModal';

export default function AppHeader() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const resetChat = useChatStore((state) => state.resetChat);
  const showBack = useAppStore((state) => state.showBack);
  const { goHome } = useAppNavigation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userMenuRef = useRef(null);
  const avatarSrc = resolveAvatarSrc(user?.avatar_url);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    resetChat();
    logout();
  };

  const handleOpenProfile = () => {
    setUserMenuOpen(false);
    setProfileOpen(true);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {showBack && (
          <button type="button" className="ghost back-button" onClick={goHome}>
            返回首页
          </button>
        )}
        <div className="title">
          <img src="/hero.png" alt="" aria-hidden="true" />
          <span>信我么</span>
        </div>
      </div>
      <div className="header-actions">
        <div className="user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="user-button"
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            {avatarSrc && <img className="user-avatar" src={avatarSrc} alt="avatar" />}
            <span>{user?.username || '用户'}</span>
          </button>
          {userMenuOpen && (
            <div className="dropdown">
              <button type="button" onClick={handleOpenProfile}>
                <img src="/modife.png" alt="" aria-hidden="true" />
                修改信息
              </button>
              <button type="button" onClick={handleLogout}>
                <img src="/logout.png" alt="" aria-hidden="true" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </header>
  );
}
