import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/register', { username, email, password });
      // On success, redirect to login
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join our platform today">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div className="error-message">{error}</div>}
        
        <InputField
          label="Username"
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          required
        />
        
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

        <InputField
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        
        <Button type="submit" isLoading={isLoading}>
          Sign Up
        </Button>
      </form>
      
      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <Link to="/login">Already have an account? Sign in</Link>
      </div>
    </AuthCard>
  );
};
