import React, { useEffect, useState } from 'react';
import useUserStore from '../store/useUserStore';
import { resolveAvatarSrc } from '../utils/formatters';

const emptyProfile = {
  username: '',
  email: '',
  avatar_url: ''
};

export default function ProfileModal({ onClose }) {
  const user = useUserStore((state) => state.user);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [profileMessage, setProfileMessage] = useState('');
  const [avatarFileKey, setAvatarFileKey] = useState(0);
  const avatarPreview = resolveAvatarSrc(profileForm.avatar_url);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      username: user.username || '',
      email: user.email || '',
      avatar_url: user.avatar_url || ''
    });
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    try {
      const updated = await updateProfile(profileForm);
      setProfileForm({
        username: updated?.username || '',
        email: updated?.email || '',
        avatar_url: updated?.avatar_url || ''
      });
      setProfileMessage('资料已更新。');
      setAvatarFileKey((prev) => prev + 1);
    } catch (error) {
      setProfileMessage(error.message || '更新失败。');
    }
  };

  const handleProfileFieldChange = (field) => (event) => {
    setProfileForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfileForm((prev) => ({ ...prev, avatar_url: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfileForm((prev) => ({ ...prev, avatar_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

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
        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <label>
            用户名
            <input
              value={profileForm.username}
              onChange={handleProfileFieldChange('username')}
            />
          </label>
          <label>
            邮箱
            <input
              value={profileForm.email}
              onChange={handleProfileFieldChange('email')}
            />
          </label>
          <label>
            头像上传
            <input
              key={avatarFileKey}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
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
