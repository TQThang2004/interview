export const API_BASE = "http://localhost:8000/api";

export const api = {
  startInterview: async (topic, level, language) => {
    const res = await fetch(`${API_BASE}/start-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, language })
    });
    return res.json();
  },
  evaluate: async (question, reference, answer, level, language) => {
    const res = await fetch(`${API_BASE}/evaluate`, {
      method: "POST",
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
      body: formData
    });
    return res.json();
  },
  tts: async (text, language, activeAudioRef) => {
    try {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const res = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
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
  }
};
