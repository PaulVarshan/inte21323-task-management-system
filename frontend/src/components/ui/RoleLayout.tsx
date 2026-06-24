import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { 
  LayoutDashboard, Folder, Users, CheckSquare, Columns, 
  BarChart2, Bell, LogOut, Settings, HelpCircle, FileText,
  MessageSquare, Paperclip, Circle
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  children?: NavItem[];
}

const getIconForLabel = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('dashboard')) return <LayoutDashboard size={18} />;
  if (l.includes('project')) return <Folder size={18} />;
  if (l.includes('team') || l.includes('user')) return <Users size={18} />;
  if (l.includes('task')) return <CheckSquare size={18} />;
  if (l.includes('kanban')) return <Columns size={18} />;
  if (l.includes('report') || l.includes('analytic')) return <BarChart2 size={18} />;
  if (l.includes('notification')) return <Bell size={18} />;
  if (l.includes('comment')) return <MessageSquare size={18} />;
  if (l.includes('attachment')) return <Paperclip size={18} />;
  return <Circle size={18} />; // Default fallback
};

export const RoleLayout = ({ roleName, navItems }: { roleName: string, navItems: NavItem[] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        background: '#fff', 
        borderRight: '1px solid var(--surface-border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '2rem 0'
      }}>
        {/* Brand / Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>D</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Donezo</h2>
        </div>

        {/* MENU Section */}
        <div style={{ padding: '0 2rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '1px' }}>MENU</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const hasChildren = (item.children?.length ?? 0) > 0;
            const isParentActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            if (!hasChildren) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    position: 'relative',
                    padding: '0.75rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-color)' : '#9ca3af', // Inactive is light grey as in screenshot
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '5px', height: '28px', background: 'var(--primary-color)', borderRadius: '0 4px 4px 0' }} />}
                      {getIconForLabel(item.label)}
                      <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <div key={item.path} style={{ display: 'flex', flexDirection: 'column' }}>
                <NavLink to={item.children![0].path} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      position: 'relative',
                      padding: '0.75rem 2rem',
                      color: isParentActive ? 'var(--primary-color)' : '#9ca3af',
                      fontWeight: isParentActive ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    {isParentActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '5px', height: '28px', background: 'var(--primary-color)', borderRadius: '0 4px 4px 0' }} />}
                    {getIconForLabel(item.label)}
                    <span style={{ flex: 1, fontSize: '0.95rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.8rem' }}>{isParentActive ? '▲' : '▼'}</span>
                  </div>
                </NavLink>

                {isParentActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.25rem' }}>
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        style={({ isActive }) => ({
                          position: 'relative',
                          padding: '0.5rem 2rem 0.5rem 3.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          textDecoration: 'none',
                          color: isActive ? 'var(--primary-color)' : '#9ca3af',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                        })}
                        end
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <div style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                            {child.label.replace(/^[≡⊞]\s*/, '')}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* GENERAL Section */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <div style={{ padding: '0 2rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '1px' }}>GENERAL</span>
          </div>

          <div style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontWeight: 500, cursor: 'pointer' }}>
            <Settings size={18} />
            <span style={{ fontSize: '0.95rem' }}>Settings</span>
          </div>
          
          <div style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontWeight: 500, cursor: 'pointer' }}>
            <HelpCircle size={18} />
            <span style={{ fontSize: '0.95rem' }}>Help</span>
          </div>

          <div 
            onClick={handleLogout}
            style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
          >
            <LogOut size={18} />
            <span style={{ fontSize: '0.95rem' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', background: '#fff' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{roleName} Portal</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong>
            </div>
            <NotificationBell />
          </div>
        </div>
        
        {/* Page Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
