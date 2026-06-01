import React from 'react';
import { Clock, Star, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import ScoreChip from '../../../components/common/ScoreChip';
import { StatusBadge, formatDate, calcDuration } from './historyHelpers';
import HistoryDetailExpand from './HistoryDetailExpand';

export default function HistoryCard({
  historyItem: h,
  expanded,
  toggleExpand,
  loadingDetail,
  detailData
}) {
  const duration = calcDuration(h.started_at, h.completed_at);

  return (
    <div className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.25s' }}>
      {/* ── Row chính ── */}
      <div
        style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
        onClick={() => toggleExpand(h.id)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{h.topic}</span>
            <StatusBadge status={h.status} />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={11} /> {h.level}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {formatDate(h.started_at)}
              {duration && ` · ${duration}`}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {h.answered_questions}/{h.total_questions} câu đã trả lời
            </span>
          </div>
        </div>
        <ScoreChip score={h.overall_score} />
        {loadingDetail === h.id
          ? <RefreshCw size={16} style={{ color: 'var(--text-muted)', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          : (expanded === h.id
            ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />)
        }
      </div>

      {/* ── Detail expand ── */}
      {expanded === h.id && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 22px', background: 'var(--bg-elevated)' }}>
          <HistoryDetailExpand detail={detailData} />
        </div>
      )}
    </div>
  );
}
