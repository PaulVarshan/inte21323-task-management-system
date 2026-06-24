import React from 'react';
import { Mail, User } from 'lucide-react';

const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const LinkedinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const MailIcon = () => <Mail size={18} />;

interface SplitAuthLayoutProps {
  isLogin: boolean;
  children: React.ReactNode;
  onToggleMode: () => void;
}

export const SplitAuthLayout: React.FC<SplitAuthLayoutProps> = ({ isLogin, children, onToggleMode }) => {
  return (
    <div className="page-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Abstract Background Shapes */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: '#D97A7A', transform: 'rotate(45deg)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px',
        background: '#EBCB69', borderRadius: '50px', zIndex: 0
      }} />

      {/* Main Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '900px',
        minHeight: '600px',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        
        {/* Sign In Form Container (Left Side) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.6s ease-in-out',
          opacity: isLogin ? 1 : 0,
          zIndex: isLogin ? 5 : 1,
          pointerEvents: isLogin ? 'auto' : 'none',
        }}>
          <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <User size={24} color="var(--primary-color)" /> Diprella
          </div>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Sign in to Diprella
          </h2>
          <SocialIcons />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>or use your email account:</p>
          <div style={{ width: '100%', maxWidth: '350px' }}>{isLogin && children}</div>
        </div>

        {/* Sign Up Form Container (Right Side) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          height: '100%',
          width: '50%',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.6s ease-in-out',
          opacity: isLogin ? 0 : 1,
          zIndex: isLogin ? 1 : 5,
          pointerEvents: isLogin ? 'none' : 'auto',
        }}>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Create Account
          </h2>
          <SocialIcons />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>or use your email for registration:</p>
          <div style={{ width: '100%', maxWidth: '350px' }}>{!isLogin && children}</div>
        </div>

        {/* Sliding Overlay Container (The Green Panel) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '50%',
          height: '100%',
          overflow: 'hidden',
          transition: 'transform 0.6s ease-in-out',
          transform: isLogin ? 'translateX(0)' : 'translateX(-100%)',
          zIndex: 10,
        }}>
          {/* Overlay Background */}
          <div style={{
            background: 'var(--primary-color)',
            backgroundPosition: '0 0',
            color: '#fff',
            position: 'relative',
            left: '-100%',
            height: '100%',
            width: '200%',
            transition: 'transform 0.6s ease-in-out',
            transform: isLogin ? 'translateX(0)' : 'translateX(50%)',
          }}>
            
            {/* Subtle geometric overlay on green panel */}
            <div style={{ position: 'absolute', top: '10%', left: '20%', width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }} />

            {/* Left Overlay Content (Shown during Sign Up) */}
            <div style={{
              position: 'absolute',
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              textAlign: 'center',
              top: 0,
              transition: 'transform 0.6s ease-in-out',
              transform: isLogin ? 'translateX(-20%)' : 'translateX(0)',
            }}>
              <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                 <User size={24} /> Diprella
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Welcome Back!</h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '80%' }}>
                To keep connected with us please login with your personal info
              </p>
              <OverlayButton text="SIGN IN" onClick={onToggleMode} />
            </div>

            {/* Right Overlay Content (Shown during Sign In) */}
            <div style={{
              position: 'absolute',
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              textAlign: 'center',
              top: 0,
              right: 0,
              transition: 'transform 0.6s ease-in-out',
              transform: isLogin ? 'translateX(0)' : 'translateX(20%)',
            }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Hello, Friend!</h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '80%' }}>
                Enter your personal details and start journey with us
              </p>
              <OverlayButton text="SIGN UP" onClick={onToggleMode} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const SocialIcons = () => (
  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
    {[FacebookIcon, MailIcon, LinkedinIcon].map((Icon, idx) => (
      <div key={idx} style={{ 
        width: '40px', height: '40px', borderRadius: '50%', 
        border: '1px solid #e5e7eb', display: 'flex', 
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#4b5563', transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
      onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
      >
        <Icon />
      </div>
    ))}
  </div>
);

const OverlayButton = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'transparent',
      border: '2px solid #fff',
      color: '#fff',
      padding: '0.75rem 3rem',
      borderRadius: '50px',
      fontWeight: 600,
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.background = '#fff';
      e.currentTarget.style.color = 'var(--primary-color)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#fff';
    }}
  >
    {text}
  </button>
);
