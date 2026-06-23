import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useModal } from '../context/ModalContext';

export function useAudioRecorder(setUserAnswer) {
  const { showAlert } = useModal();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const stopRecordingHard = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => stopRecordingHard();
  }, [stopRecordingHard]);

  const startRecording = useCallback(async () => {
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
          if (data.status === 'success') {
            setUserAnswer(prev => prev + (prev ? ' ' : '') + data.text);
          } else {
            showAlert(`Lỗi nhận diện giọng nói: ${data.detail}`);
          }
        } catch (err) {
          showAlert(`Lỗi kết nối API nhận diện giọng nói: ${err.message}`);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      showAlert('Trình duyệt không thể truy cập Microphone. Vui lòng cấp quyền.');
    }
  }, [setUserAnswer, showAlert]);

  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      stopRecordingHard();
    }
  }, [isRecording, startRecording, stopRecordingHard]);

  return { isRecording, isTranscribing, toggleRecording, stopRecordingHard };
}
