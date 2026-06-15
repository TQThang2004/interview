import { API_BASE_URL } from '../constants/api';
const API_BASE = API_BASE_URL;

export const api = {
  // ── Interview Q&A ────────────────────────────────────────────────────────
  startInterview: async (cvFile, jd, level, language) => {
    const formData = new FormData();
    if (cvFile) formData.append("cv", cvFile);
    formData.append("jd", jd || "");
    formData.append("level", level);
    formData.append("language", language);

    const res = await fetch(`${API_BASE}/start-interview`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    if (!res.ok) {
      // Lấy message lỗi từ server (FastAPI trả về { detail: "..." })
      let errorMsg = `Lỗi máy chủ (${res.status})`;
      try {
        const errData = await res.json();
        if (errData?.detail) errorMsg = errData.detail;
      } catch (_) { /* bỏ qua */ }
      throw new Error(errorMsg);
    }

    return res.json();
  },

  evaluate: async (question, reference, answer, level, language) => {
    const res = await fetch(`${API_BASE}/evaluate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, reference, answer, level, language })
    });
    return res.json();
  },

  evaluateCv: async (cvFile) => {
    const formData = new FormData();
    formData.append("cv", cvFile);
    const res = await fetch(`${API_BASE}/evaluate/cv`, {
      method: "POST",
      credentials: "include",
      body: formData
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  // ── CV Evaluation History ────────────────────────────────────────────────

  /** Lưu bản đánh giá CV lên Cloudinary + DB. */
  saveCvEvaluation: async (cvFile, evaluationResult, cvText) => {
    const formData = new FormData();
    formData.append("cv", cvFile);
    formData.append("evaluation_result", JSON.stringify(evaluationResult));
    formData.append("cv_text", cvText || "");
    const res = await fetch(`${API_BASE}/evaluate/cv/save`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  /** Đếm số bản đánh giá CV hiện có và giới hạn. */
  getCvEvaluationCount: async () => {
    const res = await fetch(`${API_BASE}/evaluate/cv/count`, { credentials: "include" });
    if (!res.ok) return { count: 0, limit: 2, can_save: true };
    return res.json();
  },

  /** Lấy danh sách lịch sử đánh giá CV. */
  getCvEvaluations: async (limit = 10, offset = 0) => {
    const res = await fetch(`${API_BASE}/evaluate/cv/history?limit=${limit}&offset=${offset}`, {
      credentials: "include",
    });
    if (!res.ok) return { evaluations: [], count: 0, limit: 2 };
    return res.json();
  },

  /** Chi tiết 1 bản đánh giá CV. */
  getCvEvaluationDetail: async (evaluationId) => {
    const res = await fetch(`${API_BASE}/evaluate/cv/history/${evaluationId}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.evaluation || null;
  },

  /** Xóa bản đánh giá CV (DB + Cloudinary). */
  deleteCvEvaluation: async (evaluationId) => {
    const res = await fetch(`${API_BASE}/evaluate/cv/history/${evaluationId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    const res = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      credentials: "include",
      body: formData
    });
    return res.json();
  },

  tts: async (text, language, activeAudioRef) => {
    try {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const res = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        activeAudioRef.current = audio;
        audio.play();
      }
    } catch (err) {
      console.error("Loi TTS:", err);
    }
  },

  // ── Interview History (lịch sử phỏng vấn) ──────────────────────────────
  /**
   * Tạo phiên phỏng vấn mới trong DB, trả về interview_id.
   * Gọi ngay sau khi nhận được questions từ /start-interview.
   */
  createInterviewRecord: async (topic, level, language) => {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, language })
    });
    if (!res.ok) return null;
    return res.json();
  },

  /** Lưu câu hỏi vào DB khi bắt đầu hỏi, trả về question_id. */
  saveQuestion: async (interviewId, questionText, questionOrder) => {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/questions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_text: questionText, question_order: questionOrder })
    });
    if (!res.ok) return null;
    return res.json();
  },

  /** Cập nhật câu trả lời + đánh giá AI sau khi chấm điểm. */
  updateAnswer: async (interviewId, questionId, userAnswer, aiEvaluation, score) => {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/questions/${questionId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_answer: userAnswer, ai_evaluation: aiEvaluation, score })
    });
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try { const d = await res.json(); detail = d?.detail || detail; } catch (_) {}
      throw new Error(`updateAnswer thất bại: ${detail}`);
    }
    return true;
  },

  /** Đánh dấu hoàn thành phiên phỏng vấn, lưu điểm tổng. */
  completeInterview: async (interviewId, overallScore, overallFeedback) => {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/complete`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overall_score: overallScore, overall_feedback: overallFeedback })
    });
    return res.ok;
  },

  /**
   * Huỷ phiên phỏng vấn (người dùng thoát giữa chừng).
   * Dùng keepalive=true để request không bị hủy khi tab đóng.
   */
  abandonInterview: async (interviewId) => {
    try {
      await fetch(`${API_BASE}/interviews/${interviewId}/abandon`, {
        method: "PATCH",
        credentials: "include",
        keepalive: true, // quan trọng: giữ request khi thoát tab
        headers: { "Content-Type": "application/json" },
      });
    } catch (_) {
      // Bỏ qua lỗi khi tab đóng
    }
  },

  /** Lấy danh sách lịch sử phỏng vấn của user. */
  getInterviews: async (limit = 20, offset = 0) => {
    const res = await fetch(`${API_BASE}/interviews?limit=${limit}&offset=${offset}`, {
      credentials: "include"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.interviews || [];
  },

  /** Lấy chi tiết một phiên phỏng vấn. */
  getInterviewDetail: async (interviewId) => {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}`, {
      credentials: "include"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.interview || null;
  },

  /** Người dùng xóa lịch sử phỏng vấn. */
  deleteInterview: async (interviewId) => {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return true;
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  },
  adminGetChartData: async (days = 30) => {
    const res = await fetch(`${API_BASE}/admin/stats/chart?days=${days}`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.chart;
  },
  adminGetUsers: async (limit = 20, offset = 0, search = "") => {
    const url = new URL(`${API_BASE}/admin/users`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    if (search) url.searchParams.append("search", search);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { users: [], total: 0 };
    return res.json();
  },
  adminCreateUser: async (userData) => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },
  adminUpdateUserRole: async (userId, role) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    return res.ok;
  },
  adminDeleteUser: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include"
    });
    return res.ok;
  },
  adminGetInterviews: async (limit = 20, offset = 0, statusFilter = "") => {
    const url = new URL(`${API_BASE}/admin/interviews`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    if (statusFilter) url.searchParams.append("status", statusFilter);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { interviews: [], total: 0 };
    return res.json();
  },
  adminGetInterviewDetail: async (interviewId) => {
    const res = await fetch(`${API_BASE}/admin/interviews/${interviewId}`, {
      credentials: "include"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.interview || null;
  },
  adminDeleteInterview: async (interviewId) => {
    const res = await fetch(`${API_BASE}/admin/interviews/${interviewId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return true;
  },
  adminGetTopCandidates: async (limit = 10) => {
    const res = await fetch(`${API_BASE}/admin/top-candidates?limit=${limit}`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.candidates;
  },
  adminGetUserDetail: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },
  adminGetRecentActivity: async (limit = 15) => {
    const res = await fetch(`${API_BASE}/admin/recent-activity?limit=${limit}`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.activities || [];
  },
  adminGetRagStatus: async () => {
    const res = await fetch(`${API_BASE}/admin/rag/status`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  },

  // ── Community ────────────────────────────────────────────────────────────
  getCommunityPosts: async (limit = 20, offset = 0, search = "", category = "", tag = "") => {
    const url = new URL(`${API_BASE}/community/posts`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    if (search) url.searchParams.append("search", search);
    if (category) url.searchParams.append("category", category);
    if (tag) url.searchParams.append("tag", tag);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },
  createCommunityPost: async (title, content, category, tags, imageUrl = null) => {
    const res = await fetch(`${API_BASE}/community/posts`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, tags, image_url: imageUrl })
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lá»—i mÃ¡y chá»§ (${res.status})`);
    }
    return res.json();
  },

  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },
  toggleLikePost: async (postId) => {
    const res = await fetch(`${API_BASE}/community/posts/${postId}/like`, {
      method: "POST",
      credentials: "include"
    });
    return res.json();
  },
  toggleSavePost: async (postId) => {
    const res = await fetch(`${API_BASE}/community/posts/${postId}/save`, {
      method: "POST",
      credentials: "include"
    });
    return res.json();
  },
  getPopularTags: async (limit = 10) => {
    const res = await fetch(`${API_BASE}/community/tags?limit=${limit}`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags;
  },

  getMyPosts: async (limit = 20, offset = 0) => {
    const url = new URL(`${API_BASE}/community/my-posts`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },

  deleteCommunityPost: async (postId) => {
    const res = await fetch(`${API_BASE}/community/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lá»—i mÃ¡y chá»§ (${res.status})`);
    }
    return res.json();
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: async (limit = 20) => {
    const res = await fetch(`${API_BASE}/community/notifications?limit=${limit}`, {
      credentials: "include",
    });
    if (!res.ok) return { notifications: [], unread_count: 0 };
    return res.json();
  },
  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/community/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    return res.ok;
  },
  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/community/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    });
    return res.ok;
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  // ── Admin Community Posts ─────────────────────────────────────────────────
  adminGetCommunityPosts: async (limit = 20, offset = 0, statusFilter = "", search = "") => {
    const url = new URL(`${API_BASE}/admin/community/posts`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    if (statusFilter) url.searchParams.append("status", statusFilter);
    if (search) url.searchParams.append("search", search);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  },
  adminApprovePost: async (postId) => {
    const res = await fetch(`${API_BASE}/admin/community/posts/${postId}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) {
      let errData; try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi (${res.status})`);
    }
    return res.json();
  },
  adminRejectPost: async (postId) => {
    const res = await fetch(`${API_BASE}/admin/community/posts/${postId}/reject`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      let errData; try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi (${res.status})`);
    }
    return res.json();
  },
  adminDeleteCommunityPost: async (postId) => {
    const res = await fetch(`${API_BASE}/admin/community/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  },

  // ── Admin CV Evaluations ─────────────────────────────────────────────────
  adminGetCVEvaluations: async (limit = 20, offset = 0, search = "") => {
    const url = new URL(`${API_BASE}/admin/cv-evaluations`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    if (search) url.searchParams.append("search", search);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return { evaluations: [], total: 0 };
    return res.json();
  },
  adminDeleteCVEvaluation: async (evalId) => {
    const res = await fetch(`${API_BASE}/admin/cv-evaluations/${evalId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  },

  // ── Practice (Quiz) ────────────────────────────────────────────────────────

  /** Lấy danh sách 13 chủ đề luyện tập. */
  getPracticeTopics: async () => {
    const res = await fetch(`${API_BASE}/practice/topics`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.topics || [];
  },

  /**
   * Bắt đầu bài kiểm tra.
   * Trả về {session_id, topic, level, language, num_questions, questions[]}
   */
  startPractice: async (topic, level, language, numQuestions) => {
    const res = await fetch(`${API_BASE}/practice/start`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, language, num_questions: numQuestions }),
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  /**
   * Nộp toàn bộ bài kiểm tra (Phương án B).
   * answers: [{answer_id, user_answer}, ...]
   * Trả về {overall_score, correct_count, total_questions, results[]}
   */
  submitPractice: async (sessionId, answers) => {
    const res = await fetch(`${API_BASE}/practice/sessions/${sessionId}/submit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch (_) {}
      throw new Error(errData?.detail || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  },

  /** Huỷ bài kiểm tra đang làm. */
  abandonPractice: async (sessionId) => {
    try {
      await fetch(`${API_BASE}/practice/sessions/${sessionId}/abandon`, {
        method: "PATCH",
        credentials: "include",
        keepalive: true,
      });
    } catch (_) { /* bỏ qua */ }
  },

  /** Lấy thống kê luyện tập theo chủ đề (cho Dashboard). */
  getPracticeStats: async () => {
    const res = await fetch(`${API_BASE}/practice/stats`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.stats || [];
  },

  /** Lấy lịch sử bài kiểm tra. */
  getPracticeSessions: async (limit = 20, offset = 0) => {
    const res = await fetch(
      `${API_BASE}/practice/sessions?limit=${limit}&offset=${offset}`,
      { credentials: "include" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  },

  /** Chi tiết 1 bài kiểm tra (kèm đáp án sau khi hoàn thành). */
  getPracticeDetail: async (sessionId) => {
    const res = await fetch(`${API_BASE}/practice/sessions/${sessionId}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.session || null;
  },

  /** Xóa bài kiểm tra. */
  deletePracticeSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/practice/sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  },
};

