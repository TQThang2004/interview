import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export function useAudioRecorder(setUserAnswer) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => stopRecordingHard();
  }, []);

  const stopRecordingHard = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecordingHard();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const data = await api.transcribe(audioBlob);
          if (data.status === "success") {
            setUserAnswer(prev => prev + (prev ? " " : "") + data.text);
          } else {
            alert("Lỗi Whisper: " + data.detail);
          }
        } catch(err) {
          alert("Lỗi kết nối Whisper API: " + err.message);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Trình duyệt không thể truy cập Microphone! Vui lòng cấp quyền.");
    }
  };

  return { isRecording, isTranscribing, toggleRecording, stopRecordingHard };
}
