import React from 'react';
import type { ProjectProgressData } from '../../services/dashboard.service';

interface ProjectProgressProps {
  projects: ProjectProgressData[];
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ projects }) => {
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
        Project Task Progress
      </h3>
      
      {projects.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No projects available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {projects.map((proj) => (
            <div key={proj.project_id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ 
                  fontWeight: 500, 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  maxWidth: '14ch', 
                  display: 'inline-block' 
                }} title={proj.project_name}>
                  {proj.project_name}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {proj.completed_tasks}/{proj.total_tasks} Tasks ({proj.progress_percentage}%)
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f3f4f6', // Light gray track for light theme
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${proj.progress_percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #34d399 0%, var(--primary-color) 100%)', // Vibrant green gradient
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
