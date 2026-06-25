import React from 'react';
import type { RecentTaskData } from '../../services/dashboard.service';

interface RecentTasksProps {
  tasks: RecentTaskData[];
  onTaskClick?: (taskId: number) => void;
}

export const RecentTasks: React.FC<RecentTasksProps> = ({ tasks, onTaskClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return '#10b981';
      case 'REVIEW': return '#a855f7';
      case 'IN_PROGRESS': return '#eab308';
      case 'TODO': return '#3b82f6';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        🔄 Recent Activity / Tasks
      </h3>
      
      <div style={{ overflowX: 'auto', maxHeight: '350px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Task Name</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Project</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Assignees</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No recent task activity.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.task_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => onTaskClick && onTaskClick(task.task_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        textAlign: 'left'
                      }}
                    >
                      {task.title}
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch', display: 'inline-block', verticalAlign: 'bottom' }} title={task.project_name}>{task.project_name}</span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                    {task.assignees.join(', ') || 'Unassigned'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.2rem 0.5rem', 
                      background: `${getStatusColor(task.status)}15`,
                      color: getStatusColor(task.status),
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {new Date(task.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
