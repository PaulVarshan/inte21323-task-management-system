import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '800px',
        width: '100%',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'center',
        background: '#fff', // Solid white instead of glass
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(90deg, var(--primary-color), #2d3748)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Task Management System
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
          The ultimate platform to organize your projects, manage teams, and track tasks effortlessly. Streamline your workflow with our intelligent role-based architecture.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Sign In
            </Button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', background: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
              Create Account
            </Button>
          </Link>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--surface-border)', width: '100%' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you a system administrator? <Link to="/adminlogin" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Admin Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
