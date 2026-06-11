import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <p>Roles: {user.roles?.join(', ')}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}