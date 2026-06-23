import React, { useState } from 'react';
import { Send, Mic, Square, Edit3, Bot, Volume2, SkipForward, LogOut } from 'lucide-react';

export default function InterviewPanel({ 
  q, currentIdx, totalQuestions, 
  userAnswer, setUserAnswer, 
  isRecording, isTranscribing, toggleRecording,
  onSubmit, onSpeak, onSkip, onEndInterview
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 40px)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} style={{ 
                height: '6px', width: '32px', borderRadius: '4px', transition: 'all 0.3s',
                background: i < currentIdx ? 'var(--primary)' : i === currentIdx ? 'var(--primary-60)' : 'var(--bg-elevated)'
              }}></div>
            ))}
          </div>
          <div style={{ 
            fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: '20px', 
            border: '1px solid var(--border)' 
          }}>
            Câu hỏi {currentIdx + 1} / {totalQuestions}
          </div>
          <button onClick={onEndInterview} title="Kết thúc phỏng vấn" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
            background: 'oklch(65% 0.22 25 / 0.1)', border: '1px solid oklch(65% 0.22 25 / 0.3)',
            color: 'oklch(70% 0.18 25)', cursor: 'pointer', transition: 'all 0.25s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.2)'; e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.1)'; e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.3)'; }}>
            <LogOut size={14} /> Kết thúc
          </button>
        </div>

        {/* AI Question Box */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ 
            width: '52px', height: '52px', background: 'var(--gradient-primary)', 
            borderRadius: '16px', borderRadiusBottomRight: '4px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 8px 24px var(--primary-30)'
          }}>
            <Bot size={28} style={{ color: 'var(--primary-contrast)' }} />
          </div>
          <div className="glass-card" style={{ 
            flex: 1, padding: '24px 32px', position: 'relative', 
            borderTopLeftRadius: '4px', boxShadow: 'none' 
          }}>
            <button onClick={onSpeak} title="Đọc lại câu hỏi" style={{ 
              absolute: true, right: '20px', top: '20px', background: 'var(--bg-elevated)',
              border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '50%',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}>
              <Volume2 size={20} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, paddingRight: '40px' }}>
              {q?.question}
            </h2>
          </div>
        </div>

        {/* User Interaction Area */}
        <div className="glass-card" style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', marginBottom: '24px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isRecording && (
              <div style={{ 
                position: 'absolute', width: '120px', height: '120px', background: 'oklch(65% 0.22 25)', 
                borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.2 
              }}></div>
            )}
            <button onClick={() => { setIsEditing(false); toggleRecording(); }} style={{ 
              position: 'relative', zIndex: 10, width: '84px', height: '84px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none',
              background: isRecording ? 'oklch(65% 0.22 25)' : 'var(--gradient-primary)',
              color: isRecording ? 'white' : 'var(--primary-contrast)',
              boxShadow: isRecording ? '0 0 30px oklch(65% 0.22 25 / 0.5)' : '0 12px 30px var(--primary-30)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transform: isRecording ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={e => { if(!isRecording) e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'; }}
            onMouseLeave={e => { if(!isRecording) e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}>
              {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={40} />}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ 
              fontWeight: 600, fontSize: '15px', 
              color: isRecording ? 'oklch(65% 0.22 25)' : (isTranscribing ? 'var(--primary)' : 'var(--text-muted)'),
              animation: isRecording || isTranscribing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}>
              {isRecording ? 'Đang thu âm (nhấn vuông để dừng)...' : (isTranscribing ? 'Đang xử lý âm thanh với AI...' : 'Bấm vào Mic để bắt đầu nói')}
            </p>
          </div>

          <div style={{ width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kết quả nhận diện:</span>
              {!isRecording && !isTranscribing && (
                <button onClick={() => setIsEditing(!isEditing)} style={{ 
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, padding: '6px 12px',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Edit3 size={14}/> {isEditing ? 'Đóng chế độ gõ' : 'Sửa trực tiếp'}
                </button>
              )}
            </div>
            
            {isEditing ? (
              <textarea 
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Nhập hoặc chỉnh sửa câu trả lời của bạn..."                     
                className="input-field"
                style={{ width: '100%', minHeight: '160px', padding: '16px', fontSize: '16px', lineHeight: 1.6 }}
              />
            ) : (
              <div style={{ 
                width: '100%', minHeight: '130px', padding: '20px', borderRadius: '12px',
                background: 'oklch(14% 0.018 250 / 0.4)', border: '1px solid var(--border)',
                transition: 'all 0.3s',
                borderColor: isRecording || isTranscribing ? 'var(--primary)' : 'var(--border)',
                boxShadow: isRecording || isTranscribing ? '0 0 0 2px var(--primary-10)' : 'none',
                overflowY: 'auto'
              }}>
                {userAnswer ? (
                  <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{userAnswer}</p>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontStyle: 'italic', margin: 0 }}>Dữ liệu giọng nói sẽ xuất hiện ở đây...</p>
                )}
              </div>
            )}
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button onClick={onSkip} disabled={isRecording || isTranscribing}
              style={{
                padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.25s',
                cursor: isRecording || isTranscribing ? 'not-allowed' : 'pointer',
                background: 'transparent',
                border: '1px solid var(--border)',
                color: isRecording || isTranscribing ? 'var(--text-muted)' : 'var(--text-secondary)',
                opacity: isRecording || isTranscribing ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!isRecording && !isTranscribing) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-06)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
              <SkipForward size={16} /> Bỏ qua
            </button>
            <button onClick={onSubmit} disabled={!userAnswer.trim() || isRecording || isTranscribing}
              style={{
                padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, 
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.25s', border: 'none',
                cursor: !userAnswer.trim() || isRecording || isTranscribing ? 'not-allowed' : 'pointer',
                background: !userAnswer.trim() || isRecording || isTranscribing ? 'var(--bg-elevated)' : 'white',
                color: !userAnswer.trim() || isRecording || isTranscribing ? 'var(--text-muted)' : 'oklch(14% 0.018 250)',
                transform: !userAnswer.trim() || isRecording || isTranscribing ? 'none' : 'translateY(-2px)',
                boxShadow: !userAnswer.trim() || isRecording || isTranscribing ? 'none' : '0 8px 16px oklch(0% 0 0 / 0.2)',
              }}>
              {isRecording ? 'Đang Thu Âm...' : (isTranscribing ? 'Đang xử lý...' : 'Nộp Câu Trả Lời')} 
              <Send size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
