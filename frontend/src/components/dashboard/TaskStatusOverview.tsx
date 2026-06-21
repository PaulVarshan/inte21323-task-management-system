import React from 'react';
import type { TaskStatusCounts } from '../../services/dashboard.service';

interface TaskStatusOverviewProps {
  statusCounts: TaskStatusCounts;
}

export const TaskStatusOverview: React.FC<TaskStatusOverviewProps> = ({ statusCounts }) => {
  const statuses = [
    { label: 'To Do', count: statusCounts.TODO, color: '#3b82f6', tint: 'rgba(59, 130, 246, 0.1)', icon: '📋' },
    { label: 'In Progress', count: statusCounts.IN_PROGRESS, color: '#eab308', tint: 'rgba(234, 179, 8, 0.1)', icon: '⚙️' },
    { label: 'In Review', count: statusCounts.REVIEW, color: '#a855f7', tint: 'rgba(168, 85, 247, 0.1)', icon: '🔍' },
    { label: 'Completed', count: statusCounts.DONE, color: '#10b981', tint: 'rgba(16, 185, 129, 0.1)', icon: '✅' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        📊 Tasks by Status
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {statuses.map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '6px',
              backgroundColor: stat.tint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {stat.icon}
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {stat.label}
              </span>
              <strong style={{ fontSize: '1.2rem', color: stat.color }}>
                {stat.count}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
