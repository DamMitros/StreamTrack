const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFullAvatarUrl = (avatarUrl: string | undefined | null): string | null => {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  if (avatarUrl.startsWith('/static/')) {
    return `${API_URL}${avatarUrl}`;
  }

  if (!avatarUrl.startsWith('/')) {
    return `${API_URL}/static/avatars/${avatarUrl}`;
  }

  return `${API_URL}${avatarUrl}`;
};

export const getAvatarInitial = (name: string | undefined | null): string => {
  if (!name || name.trim() === '') {
    return 'U';
  }
  return name.trim()[0].toUpperCase();
};