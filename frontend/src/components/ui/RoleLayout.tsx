import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

interface NavItem {
  path: string;
  label: string;
  children?: NavItem[];
}


export const RoleLayout = ({ roleName, navItems }: { roleName: string, navItems: NavItem[] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          {navItems.map((item) => {
            const hasChildren = (item.children?.length ?? 0) > 0;
            const isParentActive =
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            if (!hasChildren) {
              return (
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
                    fontWeight: isActive ? '600' : '400',
                  })}
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div key={item.path} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <NavLink to={item.children![0].path} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          color: isParentActive ? '#fff' : 'var(--text-secondary)',
          background: isParentActive ? 'var(--primary-color)' : 'transparent',
          fontWeight: isParentActive ? '600' : '400',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span>{item.label}</span>
        <span>{isParentActive ? '▲' : '▼'}</span>
      </div>
      </NavLink>

      {isParentActive &&
        item.children!.map((child) => (
          <NavLink
            key={child.path}
            to={child.path}
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '600' : '400',
              marginLeft: '0.75rem',
            })}
            end
          >
            {child.label}
          </NavLink>
        ))}
    </div>
  );
})}
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
