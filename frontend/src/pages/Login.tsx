import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SplitAuthLayout } from '../components/ui/SplitAuthLayout';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('Collaborator');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const { user } = response.data;
      
      login(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout isLogin={true} onToggleMode={() => navigate('/register')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        {error && <div className="error-message">{error}</div>}
        
        <InputField
          type="email"
          id="email"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        
        <InputField
          type="password"
          id="password"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <a href="/forgot-password" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Forgot your password?
          </a>
        </div>
        
        <div style={{ marginTop: '1rem', width: '100%' }}>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
            style={{ 
              width: '100%', 
              padding: '0.875rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--surface-border)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 500,
              outline: 'none',
              appearance: 'none', /* Custom arrow below */
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310b981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem top 50%',
              backgroundSize: '0.65rem auto',
            }}
          >
            <option value="Collaborator">Login as: Collaborator</option>
            <option value="Project Manager">Login as: Project Manager</option>
          </select>
        </div>
        
        <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" isLoading={isLoading} style={{ borderRadius: '50px', background: 'var(--primary-color)', width: '200px' }}>
            SIGN IN
          </Button>
        </div>
      </form>
    </SplitAuthLayout>
  );
};
