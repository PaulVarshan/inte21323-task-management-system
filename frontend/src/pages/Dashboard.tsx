import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Dashboard</h1>
          <div style={{ width: '150px' }}>
            <Button onClick={handleLogout}>Log Out</Button>
          </div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Welcome, {user?.username || 'User'}!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            You have successfully logged in. Your role is: <strong>{user?.role}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
