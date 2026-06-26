import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SplitAuthLayoutProps {
  isLogin: boolean;
  children: React.ReactNode;
  onToggleMode?: () => void;
}

export const SplitAuthLayout: React.FC<SplitAuthLayoutProps> = ({ isLogin, children }) => {
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      
      {/* Background Shapes */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'rgba(59, 130, 246, 0.1)', transform: 'rotate(45deg)', zIndex: 0, borderRadius: '60px'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px',
        background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50px', zIndex: 0
      }} />

      <div className="glass-panel" style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '450px',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--surface-color)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary-color)', color: '#fff', borderRadius: '50%', padding: '1rem', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
            <User size={32} />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
          {isLogin ? 'Sign in to your account' : 'Create an account'}
        </h2>
        
        <div style={{ width: '100%' }}>{children}</div>
      </div>
    </div>
  );
};
