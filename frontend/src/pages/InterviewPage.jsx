import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useInterviewAudio } from '../hooks/useInterviewAudio';
import { useInterviewSession } from '../hooks/useInterviewSession';

import SetupForm from '../components/interview/SetupForm';
import LoadingScreen from '../components/common/LoadingScreen';
import InterviewPanel from '../components/interview/InterviewPanel';
import EvaluationResult from '../components/interview/EvaluationResult';
import FinalResult from '../components/interview/FinalResult';

export default function InterviewPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const audio = useInterviewAudio();

  const session = useInterviewSession({
    user,
    showAlert,
    showConfirm,
    audio: audio.actions,
  });

  useEffect(() => {
    audio.setTranscriptTarget(session.setUserAnswer);
  }, [audio, session.setUserAnswer]);

  if (session.appState === 'SETUP') {
    return (
      <>
        {session.serverError && (
          <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, maxWidth: '520px', width: '90%',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px 18px', borderRadius: '14px',
            background: 'oklch(14% 0.025 25)', border: '1px solid oklch(65% 0.2 25 / 0.5)',
            boxShadow: '0 8px 32px oklch(0% 0 0 / 0.45)'
          }}>
            <AlertCircle size={18} style={{ color: 'oklch(65% 0.2 25)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'oklch(82% 0.12 25)' }}>
                Không thể bắt đầu phỏng vấn
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'oklch(68% 0.08 25)', lineHeight: 1.5 }}>
                {session.serverError}
              </p>
            </div>
            <button
              onClick={() => session.setServerError('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 6px', fontSize: '18px', color: 'var(--text-muted)',
                lineHeight: 1
              }}
            >x</button>
          </div>
        )}
        <SetupForm {...{ ...session.setup, onStart: session.startInterview }} />
      </>
    );
  }

  if (session.appState === 'LOADING_QUESTIONS' || session.appState === 'EVALUATING') {
    return (
      <LoadingScreen
        message={session.appState === 'LOADING_QUESTIONS'
          ? 'Đang chuẩn bị câu hỏi từ CV/JD...'
          : 'Đang chấm điểm...'}
      />
    );
  }

  if (session.appState === 'FINISHED') {
    return (
      <FinalResult
        history={session.finalScores}
        topic={session.topicLabel}
        total={session.questions.length}
        onRestart={session.restart}
      />
    );
  }

  if (session.appState === 'INTERVIEWING') {
    return (
      <InterviewPanel
        q={session.questions[session.currentIdx]}
        currentIdx={session.currentIdx}
        totalQuestions={session.questions.length}
        userAnswer={session.userAnswer}
        setUserAnswer={session.setUserAnswer}
        isRecording={audio.isRecording}
        isTranscribing={audio.isTranscribing}
        toggleRecording={audio.toggleRecording}
        onSubmit={session.submitAnswer}
        onSpeak={() => audio.speak(session.questions[session.currentIdx].question, session.setup.language)}
        onSkip={session.skipQuestion}
        onEndInterview={session.endInterviewEarly}
      />
    );
  }

  if (session.appState === 'SHOW_EVAL') {
    return (
      <EvaluationResult
        result={session.evalResult}
        onNext={session.nextQuestion}
        isLast={session.currentIdx === session.questions.length - 1}
      />
    );
  }

  return null;
}
