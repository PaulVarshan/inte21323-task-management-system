import React from 'react';
import type { UpcomingDeadlinesData } from '../../services/dashboard.service';

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadlinesData;
  onTaskClick?: (taskId: number) => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines, onTaskClick }) => {
  const sections = [
    { title: 'Due Today', tasks: deadlines.today, color: '#ef4444', badge: 'rgba(239, 68, 68, 0.15)' },
    { title: 'Next 3 Days', tasks: deadlines.next3Days, color: '#f59e0b', badge: 'rgba(245, 158, 11, 0.15)' },
    { title: 'Next 7 Days', tasks: deadlines.next7Days, color: '#10b981', badge: 'rgba(16, 185, 129, 0.15)' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        📅 Upcoming Deadlines
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {sections.map((sec, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `2px solid ${sec.color}40`,
              paddingBottom: '0.4rem'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: sec.color }}>{sec.title}</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                background: sec.badge,
                color: sec.color
              }}>
                {sec.tasks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {sec.tasks.length === 0 ? (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No tasks due
                </span>
              ) : (
                sec.tasks.map(t => (
                  <div key={t.task_id} style={{
                    padding: '0.6rem',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    <button
                      onClick={() => onTaskClick && onTaskClick(t.task_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        textAlign: 'left',
                        fontSize: '0.85rem'
                      }}
                    >
                      {t.title}
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {t.project_name} • {new Date(t.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
