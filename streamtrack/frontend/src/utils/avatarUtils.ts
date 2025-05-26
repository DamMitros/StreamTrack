const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFullAvatarUrl = (avatarUrl: string | undefined | null): string | null => {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  const baseUrl = API_URL?.replace('/api', '') || 'http://localhost:8000';

  if (avatarUrl.startsWith('/static/')) {
    return `${baseUrl}${avatarUrl}`;
  }

  if (!avatarUrl.startsWith('/')) {
    return `${baseUrl}/static/avatars/${avatarUrl}`;
  }

  return `${baseUrl}${avatarUrl}`;
};

export const getAvatarInitial = (name: string | undefined | null): string => {
  if (!name || name.trim() === '') {
    return 'U';
  }
  return name.trim()[0].toUpperCase();
};