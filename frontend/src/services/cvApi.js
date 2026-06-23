import { apiFetch, jsonOrThrow } from './apiClient';

export const cvApi = {
  evaluateCv: async (cvFile) => {
    const formData = new FormData();
    formData.append('cv', cvFile);
    const res = await apiFetch('/evaluate/cv', { method: 'POST', body: formData });
    return jsonOrThrow(res);
  },

  saveCvEvaluation: async (cvFile, evaluationResult, cvText) => {
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('evaluation_result', JSON.stringify(evaluationResult));
    formData.append('cv_text', cvText || '');
    const res = await apiFetch('/evaluate/cv/save', { method: 'POST', body: formData });
    return jsonOrThrow(res);
  },

  getCvEvaluationCount: async () => {
    const res = await apiFetch('/evaluate/cv/count');
    if (!res.ok) return { count: 0, limit: 2, can_save: true };
    return res.json();
  },

  getCvEvaluations: async (limit = 10, offset = 0) => {
    const res = await apiFetch(`/evaluate/cv/history?limit=${limit}&offset=${offset}`);
    if (!res.ok) return { evaluations: [], count: 0, limit: 2 };
    return res.json();
  },

  getCvEvaluationDetail: async (evaluationId) => {
    const res = await apiFetch(`/evaluate/cv/history/${evaluationId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.evaluation || null;
  },

  deleteCvEvaluation: async (evaluationId) => {
    const res = await apiFetch(`/evaluate/cv/history/${evaluationId}`, { method: 'DELETE' });
    return jsonOrThrow(res);
  },
};
