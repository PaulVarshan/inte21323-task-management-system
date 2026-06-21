import React from 'react';
import type { ProjectProgressData } from '../../services/dashboard.service';

interface ProjectProgressProps {
  projects: ProjectProgressData[];
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ projects }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        📈 Project Task Progress
      </h3>
      
      {projects.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No projects available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {projects.map((proj) => (
            <div key={proj.project_id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>{proj.project_name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {proj.completed_tasks}/{proj.total_tasks} Tasks ({proj.progress_percentage}%)
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${proj.progress_percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-color) 0%, #a855f7 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease-out'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
