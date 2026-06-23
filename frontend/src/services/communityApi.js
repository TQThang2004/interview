import { apiFetch, buildQueryUrl, jsonOrThrow } from './apiClient';

export const communityApi = {
  getCommunityPosts: async (limit = 20, offset = 0, search = '', category = '', tag = '') => {
    const url = buildQueryUrl('/community/posts', { limit, offset, search, category, tag });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },

  createCommunityPost: async (title, content, category, tags, imageUrl = null) => {
    const res = await apiFetch('/community/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category, tags, image_url: imageUrl }),
    });
    return jsonOrThrow(res);
  },

  toggleLikePost: async (postId) => {
    const res = await apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
    return res.json();
  },

  toggleSavePost: async (postId) => {
    const res = await apiFetch(`/community/posts/${postId}/save`, { method: 'POST' });
    return res.json();
  },

  getPopularTags: async (limit = 10) => {
    const res = await apiFetch(`/community/tags?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags;
  },

  getMyPosts: async (limit = 20, offset = 0) => {
    const url = buildQueryUrl('/community/my-posts', { limit, offset });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },

  deleteCommunityPost: async (postId) => {
    const res = await apiFetch(`/community/posts/${postId}`, { method: 'DELETE' });
    return jsonOrThrow(res);
  },

  getNotifications: async (limit = 20) => {
    const res = await apiFetch(`/community/notifications?limit=${limit}`);
    if (!res.ok) return { notifications: [], unread_count: 0 };
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await apiFetch(`/community/notifications/${id}/read`, { method: 'PATCH' });
    return res.ok;
  },

  markAllNotificationsRead: async () => {
    const res = await apiFetch('/community/notifications/read-all', { method: 'PATCH' });
    return res.ok;
  },
};
