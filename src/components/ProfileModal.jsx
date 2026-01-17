import React from 'react';
import { resolveAvatarSrc } from '../utils/formatters';

export default function ProfileModal({
  user,
  profileForm,
  profileMessage,
  avatarFileKey,
  onClose,
  onSubmit,
  onFieldChange,
  onAvatarChange
}) {
  const avatarPreview = resolveAvatarSrc(profileForm.avatar_url);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>个人信息</h3>
            <div className="modal-subtitle">{user?.username || '用户'}</div>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            X
          </button>
        </div>
        <form className="profile-form" onSubmit={onSubmit}>
          <label>
            用户名
            <input
              value={profileForm.username}
              onChange={(event) => onFieldChange('username', event.target.value)}
            />
          </label>
          <label>
            邮箱
            <input
              value={profileForm.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
            />
          </label>
          <label>
            头像上传
            <input
              key={avatarFileKey}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </label>
          {avatarPreview && (
            <div className="avatar-preview">
              <img src={avatarPreview} alt="avatar preview" />
            </div>
          )}
          {profileMessage && <div className="form-hint">{profileMessage}</div>}
          <button type="submit" className="primary">
            更新资料
          </button>
        </form>
      </div>
    </div>
  );
}
