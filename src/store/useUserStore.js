import { create } from 'zustand';
import { auth } from '../api/client';
import { normalizeAvatarBase64 } from '../utils/formatters';
import { resolveProfile, resolveTokenPayload } from '../utils/resolve';

const getInitialToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
};

const persistToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

const useUserStore = create((set, get) => ({
  token: getInitialToken(),
  user: null,
  profileLoading: false,
  async login(payload) {
    const result = await auth.login(payload);
    const data = resolveTokenPayload(result);
    const accessToken = data?.access_token || data?.accessToken || '';
    if (!accessToken) {
      throw new Error('登录失败。');
    }
    persistToken(accessToken);
    set({ token: accessToken });
    await get().loadProfile(accessToken);
    return accessToken;
  },
  async register(payload) {
    await auth.register(payload);
  },
  logout() {
    persistToken('');
    set({ token: '', user: null });
  },
  async loadProfile(overrideToken) {
    const token = overrideToken || get().token;
    if (!token) return null;
    set({ profileLoading: true });
    try {
      const result = await auth.me(token);
      const profile = resolveProfile(result);
      set({ user: profile, profileLoading: false });
      return profile;
    } catch (error) {
      set({ profileLoading: false });
      if (error?.status === 401) {
        get().logout();
      }
      throw error;
    }
  },
  async updateProfile(profileForm) {
    const token = get().token;
    if (!token) {
      throw new Error('请先登录。');
    }
    try {
      const avatarBase64 = normalizeAvatarBase64(profileForm.avatar_url);
      const payload = {
        username: profileForm.username || undefined,
        email: profileForm.email || undefined,
        avatar_url: avatarBase64 || undefined
      };
      const updated = await auth.update(token, payload);
      const profilePayload = resolveProfile(updated);
      const mergedAvatar =
        profilePayload && Object.prototype.hasOwnProperty.call(profilePayload, 'avatar_url')
          ? profilePayload.avatar_url
          : profileForm.avatar_url || get().user?.avatar_url || '';
      const mergedProfile = {
        ...(get().user || {}),
        ...(profilePayload || {}),
        avatar_url: mergedAvatar
      };
      set({ user: mergedProfile });
      return mergedProfile;
    } catch (error) {
      if (error?.status === 401) {
        get().logout();
      }
      throw error;
    }
  }
}));

export default useUserStore;
