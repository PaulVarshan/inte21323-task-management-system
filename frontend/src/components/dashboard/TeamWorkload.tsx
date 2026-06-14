import React from 'react';
import type { TeamWorkloadData } from '../../services/dashboard.service';

interface TeamWorkloadProps {
  workload: TeamWorkloadData[];
}

export const TeamWorkload: React.FC<TeamWorkloadProps> = ({ workload }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        👥 Team Workload (Active Tasks)
      </h3>
      
      <div style={{ overflowX: 'auto', maxHeight: '350px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Member</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Active Tasks</th>
            </tr>
          </thead>
          <tbody>
            {workload.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No team members found.
                </td>
              </tr>
            ) : (
              workload.map((user) => {
                const isOverloaded = user.assigned_tasks_count >= 5;
                return (
                  <tr key={user.user_id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: isOverloaded ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                      {user.username} {isOverloaded && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 700 }}>(Overloaded)</span>}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      color: isOverloaded ? '#ef4444' : 'var(--text-primary)' 
                    }}>
                      {user.assigned_tasks_count}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
