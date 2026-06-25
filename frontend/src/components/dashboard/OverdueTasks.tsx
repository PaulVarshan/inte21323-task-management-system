import React from 'react';
import type { OverdueTaskData } from '../../services/dashboard.service';

interface OverdueTasksProps {
  tasks: OverdueTaskData[];
  onTaskClick?: (taskId: number) => void;
}

export const OverdueTasks: React.FC<OverdueTasksProps> = ({ tasks, onTaskClick }) => {
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
        Overdue Tasks
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
                <tr key={task.task_id} style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => onTaskClick && onTaskClick(task.task_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
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
