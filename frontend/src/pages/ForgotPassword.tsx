import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mocking the backend call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <AuthCard title="Reset Password" subtitle="We'll send you a recovery link">
      {!isSubmitted ? (
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
          
          <Button type="submit" isLoading={isLoading}>
            Send Link
          </Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--success-color)' }}>
          <p>If an account with that email exists, we've sent a password reset link.</p>
        </div>
      )}
      
      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </AuthCard>
  );
};
