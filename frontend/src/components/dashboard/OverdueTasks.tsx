import React from 'react';
import type { OverdueTaskData } from '../../services/dashboard.service';

interface OverdueTasksProps {
  tasks: OverdueTaskData[];
  onTaskClick?: (taskId: number) => void;
}

export const OverdueTasks: React.FC<OverdueTasksProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '0.75rem' }}>
        ⚠️ Overdue Tasks
      </h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Task Name</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Project</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Assigned Users</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No overdue tasks. Excellent job!
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.task_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#ef4444' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => onTaskClick && onTaskClick(task.task_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
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
                  <td style={{ padding: '0.75rem', color: 'rgba(239,68,68,0.8)' }}>{task.project_name}</td>
                  <td style={{ padding: '0.75rem', color: 'rgba(239,68,68,0.8)' }}>
                    {task.assignees.join(', ') || 'Unassigned'}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                    {new Date(task.due_date).toLocaleDateString()}
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
