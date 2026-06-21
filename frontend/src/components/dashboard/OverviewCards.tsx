import React from 'react';
import type { OverviewStats } from '../../services/dashboard.service';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const cards = [
    { title: 'Total Projects', value: stats.total_projects, color: '#6366f1', icon: '📂' },
    { title: 'Active Projects', value: stats.active_projects, color: '#3b82f6', icon: '⚡' },
    { title: 'Total Tasks', value: stats.total_tasks, color: '#a855f7', icon: '📋' },
    { title: 'Completed Tasks', value: stats.completed_tasks, color: '#10b981', icon: '✅' },
    { title: 'In Progress Tasks', value: stats.in_progress_tasks, color: '#eab308', icon: '🔄' },
    { title: 'Overdue Tasks', value: stats.overdue_tasks, color: '#ef4444', icon: '⚠️', highlight: stats.overdue_tasks > 0 },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: card.highlight ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--surface-border)',
            background: card.highlight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 10px 20px -5px ${card.color}25`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
              {card.title}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: card.highlight ? '#ef4444' : 'var(--text-primary)' }}>
              {card.value}
            </span>
          </div>
          <span style={{
            fontSize: '1.75rem',
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '8px'
          }}>
            {card.icon}
          </span>
        </div>
      ))}
    </div>
  );
};
