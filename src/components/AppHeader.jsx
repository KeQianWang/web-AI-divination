import React from 'react';
import { resolveAvatarSrc } from '../utils/formatters';

export default function AppHeader({
  statusText,
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
        <div className="title">神秘预言师</div>
        <div className="subtitle">{statusText || '正在连接...'}</div>
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
                修改信息
              </button>
              <button type="button" onClick={onLogout}>
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
