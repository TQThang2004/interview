import { apiFetch, jsonOrThrow } from './apiClient';

export const practiceApi = {
  getPracticeTopics: async () => {
    const res = await apiFetch('/practice/topics');
    if (!res.ok) return [];
    const data = await res.json();
    return data.topics || [];
  },

  startPractice: async (topic, level, language, numQuestions) => {
    const res = await apiFetch('/practice/start', {
      method: 'POST',
      body: JSON.stringify({ topic, level, language, num_questions: numQuestions }),
    });
    return jsonOrThrow(res);
  },

  submitPractice: async (sessionId, answers) => {
    const res = await apiFetch(`/practice/sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    return jsonOrThrow(res);
  },

  abandonPractice: async (sessionId) => {
    try {
      await apiFetch(`/practice/sessions/${sessionId}/abandon`, {
        method: 'PATCH',
        keepalive: true,
      });
    } catch {
      // Ignore unload/network races.
    }
  },

  getPracticeStats: async () => {
    const res = await apiFetch('/practice/stats');
    if (!res.ok) return [];
    const data = await res.json();
    return data.stats || [];
  },

  getPracticeSessions: async (limit = 20, offset = 0) => {
    const res = await apiFetch(`/practice/sessions?limit=${limit}&offset=${offset}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  },

  getPracticeDetail: async (sessionId) => {
    const res = await apiFetch(`/practice/sessions/${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.session || null;
  },

  deletePracticeSession: async (sessionId) => {
    const res = await apiFetch(`/practice/sessions/${sessionId}`, { method: 'DELETE' });
    return res.ok;
  },
};
