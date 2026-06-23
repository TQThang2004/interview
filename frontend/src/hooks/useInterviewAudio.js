import { useCallback, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { useAudioRecorder } from './useAudioRecorder';

export function useInterviewAudio() {
  const activeAudioRef = useRef(null);
  const transcriptTargetRef = useRef(() => {});
  const { isRecording, isTranscribing, toggleRecording, stopRecordingHard } = useAudioRecorder((text) => {
    transcriptTargetRef.current(text);
  });

  const setTranscriptTarget = useCallback((setter) => {
    transcriptTargetRef.current = setter;
  }, []);

  const pauseAudio = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
  }, []);

  const speak = useCallback((text, language = 'vi') => {
    return api.tts(text, language, activeAudioRef);
  }, []);

  const stopAllAudio = useCallback(() => {
    pauseAudio();
    stopRecordingHard();
  }, [pauseAudio, stopRecordingHard]);

  useEffect(() => {
    const audio = activeAudioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
      stopRecordingHard();
    };
  }, [stopRecordingHard]);

  const actions = useMemo(() => ({
    speak,
    pauseAudio,
    stopAllAudio,
  }), [pauseAudio, speak, stopAllAudio]);

  return useMemo(() => ({
    isRecording,
    isTranscribing,
    toggleRecording,
    setTranscriptTarget,
    actions,
    speak,
    pauseAudio,
    stopAllAudio,
  }), [
    actions,
    isRecording,
    isTranscribing,
    pauseAudio,
    setTranscriptTarget,
    speak,
    stopAllAudio,
    toggleRecording,
  ]);
}
