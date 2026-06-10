import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/adminLogin', { email, password });
      const { token, user } = response.data;
      
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. You might not have Admin privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Admin Portal" subtitle="Exclusive access for Administrators">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div className="error-message">{error}</div>}
        
        <InputField
          label="Admin Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
        
        <InputField
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        
        <Button type="submit" isLoading={isLoading} style={{ background: '#0f766e' }}>
          Secure Login
        </Button>
      </form>
      
      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <Link to="/login">Back to standard portal</Link>
      </div>
    </AuthCard>
  );
};
