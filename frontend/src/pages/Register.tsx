import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join the task management system</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" placeholder="Your name"
              value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.linkRow}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>Sign in</a>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f4f5f7', padding: '1rem'
  },
  card: {
    width: '100%', maxWidth: '380px', background: '#fff',
    borderRadius: '14px', border: '1px solid #e8e8e8',
    padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
  },
  logo: {
    width: '44px', height: '44px', background: '#534AB7',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginBottom: '1.25rem'
  },
  title: { fontSize: '20px', fontWeight: 600, color: '#111', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '1.5rem' },
  error: {
    fontSize: '13px', color: '#b91c1c', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: '8px',
    padding: '10px 12px', marginBottom: '1rem'
  },
  field: { marginBottom: '14px' },
  label: {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em'
  },
  input: {
    width: '100%', height: '40px', padding: '0 12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', color: '#111', background: '#fafafa', outline: 'none'
  },
  button: {
    width: '100%', height: '42px', background: '#534AB7',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '6px'
  },
  linkRow: { textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '1.25rem' },
  link: { color: '#534AB7', fontWeight: 600, textDecoration: 'none' }
}