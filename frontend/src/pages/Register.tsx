import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplitAuthLayout } from '../components/ui/SplitAuthLayout';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { User, Mail, Lock } from 'lucide-react';

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

    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password must contain at least 1 uppercase letter.'); return; }
    if (!/[a-z]/.test(password)) { setError('Password must contain at least 1 lowercase letter.'); return; }
    if (!/[0-9]/.test(password)) { setError('Password must contain at least 1 number.'); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('Password must contain at least 1 special character.'); return; }

    setIsLoading(true);

    try {
      await api.post('/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout isLogin={false} onToggleMode={() => navigate('/login')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        {error && <div className="error-message">{error}</div>}
        
        <InputField
          type="text"
          id="username"
          icon={<User size={18} />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Name"
          required
        />
        
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

        <InputField
          type="password"
          id="confirmPassword"
          icon={<Lock size={18} />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        
        <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" isLoading={isLoading} style={{ borderRadius: '50px', background: 'var(--primary-color)', width: '200px' }}>
            SIGN UP
          </Button>
        </div>
      </form>
    </SplitAuthLayout>
  );
};
