export const API_BASE = "http://localhost:8000/api";

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
    return res.ok;
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
};

