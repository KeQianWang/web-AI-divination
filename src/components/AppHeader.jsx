import React from 'react';
import { resolveAvatarSrc } from '../utils/formatters';

export default function AppHeader({
  user,
  userMenuOpen,
  onUserMenuToggle,
  onOpenProfile,
  onLogout,
  userMenuRef
}) {
  const avatarSrc = resolveAvatarSrc(user?.avatar_url);

  return (
    <header className="app-header">
      <div>
        <div className="title">
          <img src="/hero.png" alt="" aria-hidden="true" />
          <span>信我么</span>
        </div>
      </div>
      <div className="header-actions">
        <div className="user-menu" ref={userMenuRef}>
          <button type="button" className="user-button" onClick={onUserMenuToggle}>
            {avatarSrc && (
              <img className="user-avatar" src={avatarSrc} alt="avatar" />
            )}
            <span>{user?.username || '用户'}</span>
          </button>
          {userMenuOpen && (
            <div className="dropdown">
              <button type="button" onClick={onOpenProfile}>
                <img src="/modife.png" alt="" aria-hidden="true" />
                修改信息
              </button>
              <button type="button" onClick={onLogout}>
                <img src="/logout.png" alt="" aria-hidden="true" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
