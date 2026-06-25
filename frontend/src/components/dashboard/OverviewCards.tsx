import React from 'react';
import type { OverviewStats } from '../../services/dashboard.service';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const cards = [
    { title: 'Total Projects', value: stats.total_projects, isPrimary: true },
    { title: 'Active Projects', value: stats.active_projects },
    { title: 'Total Tasks', value: stats.total_tasks },
    { title: 'Completed Tasks', value: stats.completed_tasks },
    { title: 'In Progress Tasks', value: stats.in_progress_tasks },
    { title: 'Overdue Tasks', value: stats.overdue_tasks, isDanger: stats.overdue_tasks > 0 },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.25rem'
    }}>
      {cards.map((card, idx) => {
        const isGreen = card.isPrimary;
        const textColor = isGreen ? '#fff' : 'var(--text-primary)';
        const bgColor = isGreen ? 'linear-gradient(135deg, var(--primary-color), #2d4a3e)' : '#fff';
        const circleBg = '#fff';
        const circleColor = isGreen ? '#2d4a3e' : 'var(--text-primary)';
        const circleBorder = isGreen ? 'none' : '1px solid #e5e7eb';
        const subtitleColor = isGreen ? 'rgba(255,255,255,0.7)' : '#9ca3af';

        return (
          <div
            key={idx}
            style={{
              padding: '1.75rem 1.5rem',
              borderRadius: '24px',
              background: bgColor,
              color: textColor,
              boxShadow: isGreen ? '0 10px 25px -5px rgba(45, 74, 62, 0.4)' : '0 4px 15px rgba(0,0,0,0.05)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease',
              border: card.isDanger ? '1px solid rgba(239, 68, 68, 0.4)' : (isGreen ? 'none' : '1px solid var(--surface-border)')
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {card.title}
            </h3>
            
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1 }}>
              {card.value}
            </div>

            {/* Top Right Arrow Circle */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: circleBg,
              border: circleBorder,
              color: circleColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </div>

          </div>
        );
      })}
    </div>
  );
};
