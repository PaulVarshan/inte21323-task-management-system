import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import api from '../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError('Missing email address. Please request a new OTP.');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password must contain at least 1 uppercase letter.'); return; }
    if (!/[a-z]/.test(password)) { setError('Password must contain at least 1 lowercase letter.'); return; }
    if (!/[0-9]/.test(password)) { setError('Password must contain at least 1 number.'); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('Password must contain at least 1 special character.'); return; }

    if (!otp) {
      setError('OTP is required');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/reset-password', { email, otp, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The OTP might be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthCard title="Reset Password" subtitle="Invalid Request">
        <div className="error-message" style={{ textAlign: 'center' }}>
          Missing email address. Please request a new OTP from the Forgot Password page.
        </div>
        <div className="auth-links" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/forgot-password">Go to Forgot Password</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create New Password" subtitle={`Enter the 6-digit OTP sent to ${email}`}>
      {!success ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}
          
          <InputField
            label="6-Digit OTP"
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            required
          />
          
          <InputField
            label="New Password"
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
          
          <Button type="submit" isLoading={isLoading} style={{ marginTop: '0.5rem' }}>
            Reset Password
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--success-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Password Reset Successful!</h3>
          <p>Your password has been changed successfully. You will be redirected to the login page shortly.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
};
