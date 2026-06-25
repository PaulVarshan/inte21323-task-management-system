import React from 'react';
import type { TaskStatusCounts } from '../../services/dashboard.service';
import { ListTodo, Loader2, Search, CheckCircle2 } from 'lucide-react';

interface TaskStatusOverviewProps {
  statusCounts: TaskStatusCounts;
}

export const TaskStatusOverview: React.FC<TaskStatusOverviewProps> = ({ statusCounts }) => {
  const statuses = [
    { label: 'To Do', count: statusCounts.TODO, color: '#3b82f6', tint: 'rgba(59, 130, 246, 0.1)', icon: <ListTodo size={20} color="#3b82f6" /> },
    { label: 'In Progress', count: statusCounts.IN_PROGRESS, color: '#eab308', tint: 'rgba(234, 179, 8, 0.1)', icon: <Loader2 size={20} color="#eab308" /> },
    { label: 'In Review', count: statusCounts.REVIEW, color: '#a855f7', tint: 'rgba(168, 85, 247, 0.1)', icon: <Search size={20} color="#a855f7" /> },
    { label: 'Completed', count: statusCounts.DONE, color: '#10b981', tint: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle2 size={20} color="#10b981" /> },
  ];

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '24px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
      border: '1px solid var(--surface-border)',
      padding: '1.75rem 1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem' 
    }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Tasks by Status
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {statuses.map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '1rem',
              background: '#f9fafb',
              border: '1px solid var(--surface-border)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '38px', height: '38px',
              borderRadius: '12px',
              backgroundColor: stat.tint,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>
                {stat.label}
              </span>
              <strong style={{ fontSize: '1.35rem', color: stat.color, lineHeight: 1 }}>
                {stat.count}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
