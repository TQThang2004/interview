import { apiFetch, jsonOrThrow, parseJson } from './apiClient';

export const interviewApi = {
  startInterview: async (cvFile, jd, level, language) => {
    const formData = new FormData();
    if (cvFile) formData.append('cv', cvFile);
    formData.append('jd', jd || '');
    formData.append('level', level);
    formData.append('language', language);

    const res = await apiFetch('/start-interview', { method: 'POST', body: formData });
    return jsonOrThrow(res);
  },

  evaluate: async (question, reference, answer, level, language) => {
    const res = await apiFetch('/evaluate', {
      method: 'POST',
      body: JSON.stringify({ question, reference, answer, level, language }),
    });
    return parseJson(res);
  },

  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const res = await apiFetch('/transcribe', { method: 'POST', body: formData });
    return parseJson(res);
  },

  tts: async (text, language, activeAudioRef) => {
    try {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const res = await apiFetch('/tts', {
        method: 'POST',
        body: JSON.stringify({ text, language }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        activeAudioRef.current = audio;
        audio.play();
      }
    } catch (err) {
      console.error('Lỗi TTS:', err);
    }
  },

  createInterviewRecord: async (topic, level, language) => {
    const res = await apiFetch('/interviews', {
      method: 'POST',
      body: JSON.stringify({ topic, level, language }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  saveQuestion: async (interviewId, questionText, questionOrder) => {
    const res = await apiFetch(`/interviews/${interviewId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question_text: questionText, question_order: questionOrder }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  updateAnswer: async (interviewId, questionId, userAnswer, aiEvaluation, score) => {
    const res = await apiFetch(`/interviews/${interviewId}/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ user_answer: userAnswer, ai_evaluation: aiEvaluation, score }),
    });
    if (!res.ok) {
      const data = await parseJson(res);
      throw new Error(`updateAnswer thất bại: ${data?.detail || `HTTP ${res.status}`}`);
    }
    return true;
  },

  completeInterview: async (interviewId, overallScore, overallFeedback) => {
    const res = await apiFetch(`/interviews/${interviewId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ overall_score: overallScore, overall_feedback: overallFeedback }),
    });
    return res.ok;
  },

  abandonInterview: async (interviewId) => {
    try {
      await apiFetch(`/interviews/${interviewId}/abandon`, {
        method: 'PATCH',
        keepalive: true,
      });
    } catch {
      // Ignore unload/network races.
    }
  },

  getInterviews: async (limit = 20, offset = 0) => {
    const res = await apiFetch(`/interviews?limit=${limit}&offset=${offset}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.interviews || [];
  },

  getInterviewDetail: async (interviewId) => {
    const res = await apiFetch(`/interviews/${interviewId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.interview || null;
  },

  deleteInterview: async (interviewId) => {
    const res = await apiFetch(`/interviews/${interviewId}`, { method: 'DELETE' });
    if (!res.ok) await jsonOrThrow(res);
    return true;
  },
};
