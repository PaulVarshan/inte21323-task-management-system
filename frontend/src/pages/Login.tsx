import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';

export const LoginPage: React.FC = () => {
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
    <AuthCard title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div className="error-message">{error}</div>}
        
        <InputField
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
        
        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
      
      <div className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Don't have an account?</Link>
      </div>
    </AuthCard>
  );
};
