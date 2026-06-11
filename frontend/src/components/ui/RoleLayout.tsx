import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

interface NavItem {
  path: string;
  label: string;
}

export const RoleLayout = ({ roleName, navItems }: { roleName: string, navItems: NavItem[] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', borderRadius: '0', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>{roleName} Panel</h2>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-color)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? '600' : '400'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Logged in as:<br/><strong>{user?.username}</strong>
          </p>
          <Button onClick={handleLogout} style={{ width: '100%', background: 'var(--surface-color)' }}>
            Log Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};
