import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(() => {
    const saved = localStorage.getItem('otp_cooldown_time');
    if (saved) {
      const remaining = Math.floor((parseInt(saved) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('otp_cooldown_time');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      await api.post('/forgot-password', { email });
      localStorage.setItem('otp_cooldown_time', (Date.now() + 60000).toString());
      setCooldown(60);
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email not found or reset not allowed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Reset Password" subtitle="We'll send you an OTP code via email">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <InputField
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        
        {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <Button type="submit" isLoading={isLoading} disabled={cooldown > 0}>
          {cooldown > 0 ? `Please wait ${cooldown}s...` : 'Send OTP'}
        </Button>
      </form>
      
      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </AuthCard>
  );
};
