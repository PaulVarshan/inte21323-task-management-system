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
    <SplitAuthLayout isLogin={true}>
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
        
        <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" isLoading={isLoading} style={{ borderRadius: '50px', background: 'var(--primary-color)', width: '200px' }}>
            SIGN IN
          </Button>
        </div>
      </form>
    </SplitAuthLayout>
  );
};
