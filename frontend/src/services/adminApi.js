import { apiFetch, buildQueryUrl, jsonOrThrow } from './apiClient';

export const adminApi = {
  adminGetStats: async () => {
    const res = await apiFetch('/admin/stats');
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  },

  adminGetChartData: async (days = 30) => {
    const res = await apiFetch(`/admin/stats/chart?days=${days}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.chart;
  },

  adminGetUsers: async (limit = 20, offset = 0, search = '', role = '') => {
    const url = buildQueryUrl('/admin/users', { limit, offset, search, role });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { users: [], total: 0 };
    return res.json();
  },

  adminCreateUser: async (userData) => {
    const res = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return jsonOrThrow(res);
  },

  adminUpdateUserRole: async (userId, role) => {
    const res = await apiFetch(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return res.ok;
  },

  adminDeleteUser: async (userId) => {
    const res = await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
    return res.ok;
  },

  adminGetUserDetail: async (userId) => {
    const res = await apiFetch(`/admin/users/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  adminGetInterviews: async (limit = 20, offset = 0, statusFilter = '', search = '') => {
    const url = buildQueryUrl('/admin/interviews', {
      limit,
      offset,
      status: statusFilter,
      search,
    });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { interviews: [], total: 0 };
    return res.json();
  },

  adminGetInterviewDetail: async (interviewId) => {
    const res = await apiFetch(`/admin/interviews/${interviewId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.interview || null;
  },

  adminDeleteInterview: async (interviewId) => {
    const res = await apiFetch(`/admin/interviews/${interviewId}`, { method: 'DELETE' });
    if (!res.ok) await jsonOrThrow(res);
    return true;
  },

  adminGetTopCandidates: async (limit = 10) => {
    const res = await apiFetch(`/admin/top-candidates?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.candidates;
  },

  adminGetRecentActivity: async (limit = 15) => {
    const res = await apiFetch(`/admin/recent-activity?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.activities || [];
  },

  adminGetRagStatus: async () => {
    const res = await apiFetch('/admin/rag/status');
    if (!res.ok) return null;
    return res.json();
  },

  adminGetCommunityPosts: async (
    limit = 20,
    offset = 0,
    statusFilter = '',
    search = '',
    category = ''
  ) => {
    const url = buildQueryUrl('/admin/community/posts', {
      limit,
      offset,
      status: statusFilter,
      search,
      category,
    });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },

  adminApprovePost: async (postId) => {
    const res = await apiFetch(`/admin/community/posts/${postId}/approve`, { method: 'PATCH' });
    return jsonOrThrow(res, `Lỗi (${res.status})`);
  },

  adminRejectPost: async (postId) => {
    const res = await apiFetch(`/admin/community/posts/${postId}/reject`, { method: 'POST' });
    return jsonOrThrow(res, `Lỗi (${res.status})`);
  },

  adminDeleteCommunityPost: async (postId) => {
    const res = await apiFetch(`/admin/community/posts/${postId}`, { method: 'DELETE' });
    return res.ok;
  },

  adminGetCVEvaluations: async (
    limit = 20,
    offset = 0,
    search = '',
    fromDate = '',
    toDate = ''
  ) => {
    const url = buildQueryUrl('/admin/cv-evaluations', {
      limit,
      offset,
      search,
      from_date: fromDate,
      to_date: toDate,
    });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { evaluations: [], total: 0 };
    return res.json();
  },

  adminDeleteCVEvaluation: async (evalId) => {
    const res = await apiFetch(`/admin/cv-evaluations/${evalId}`, { method: 'DELETE' });
    return res.ok;
  },

  adminGetAuditLogs: async (
    limit = 20,
    offset = 0,
    actorId = '',
    action = '',
    entityType = ''
  ) => {
    const url = buildQueryUrl('/admin/audit-logs', {
      limit,
      offset,
      actor_id: actorId,
      action,
      entity_type: entityType,
    });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return { logs: [], total: 0 };
    return res.json();
  },
};
