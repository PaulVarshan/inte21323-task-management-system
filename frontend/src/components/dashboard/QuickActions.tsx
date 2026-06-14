import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const QuickActions: React.FC = () => {
  const { user } = useAuth();
  
  // Determine role prefix: pm or admin
  const prefix = user?.role === 'Admin' ? '/admin' : '/pm';

  const actions = [
    { label: '📂 Create Project', path: `${prefix}/projects/new` },
    { label: '📋 Create Task', path: `${prefix}/tasks/new` },
    { label: '👥 Add Team Member', path: `${prefix}/teams/new` },
    { label: '📂 View Projects', path: `${prefix}/projects` },
    { label: '📋 View Tasks', path: `${prefix}/tasks` }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        ⚡ Quick Actions
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {actions.map((act, idx) => (
          <Link 
            key={idx} 
            to={act.path}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              textAlign: 'center',
              display: 'block',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--primary-color)';
              e.currentTarget.style.boxShadow = '0 4px 12px var(--primary-glow)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {act.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
