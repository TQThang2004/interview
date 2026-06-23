import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function HistoryFilters({
  search, setSearch,
  filterLevel, setFilterLevel,
  filterStatus, setFilterStatus
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
      <div className="input-group" style={{ flex: '1 1 180px' }}>
        <Search className="input-icon" />
        <input className="input-field" placeholder="Tìm kiếm chủ đề..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {['all', 'Intern', 'Junior', 'Middle', 'Senior'].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            style={{
              padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: filterLevel === l ? 'var(--gradient-primary)' : 'transparent',
              borderColor: filterLevel === l ? 'transparent' : 'var(--border)',
              color: filterLevel === l ? 'var(--primary-contrast)' : 'var(--text-secondary)',
            }}>
            {l === 'all' ? 'Tất cả' : l}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Mọi TT' },
          { key: 'completed', label: '✅ Hoàn thành' },
          { key: 'cancelled', label: '⏹ Đã thoát' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilterStatus(s.key)}
            style={{
              padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
              background: filterStatus === s.key ? 'var(--gradient-primary)' : 'transparent',
              borderColor: filterStatus === s.key ? 'transparent' : 'var(--border)',
              color: filterStatus === s.key ? 'var(--primary-contrast)' : 'var(--text-secondary)',
            }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
