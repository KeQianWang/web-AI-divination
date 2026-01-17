import { baseUrl } from '../api/client';

const MOOD_EMOJI_MAP = {
  default: '😊',
  friendly: '😊',
  upbeat: '😄',
  angry: '😠',
  depressed: '😔',
  cheerful: '😃'
};

export const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export const resolveAudioUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

export const resolveAvatarSrc = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('data:')) return avatar;
  if (avatar.startsWith('http')) return avatar;
  return `data:image/png;base64,${avatar}`;
};

export const normalizeAvatarBase64 = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return '';
  if (avatar.startsWith('data:')) {
    const commaIndex = avatar.indexOf(',');
    if (commaIndex === -1) return '';
    return avatar.slice(commaIndex + 1);
  }
  return avatar;
};

export const resolveMoodEmoji = (mood) => {
  if (!mood) return '';
  const key = String(mood).toLowerCase();
  return MOOD_EMOJI_MAP[key] || MOOD_EMOJI_MAP.default;
};
