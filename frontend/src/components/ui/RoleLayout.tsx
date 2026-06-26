import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { 
  LayoutDashboard, Folder, Users, CheckSquare, Columns, 
  BarChart2, Bell, LogOut, Settings, HelpCircle, FileText,
  MessageSquare, Paperclip, Circle, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  path: string;
  label: string;
  children?: NavItem[];
}

const getIconForLabel = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('dashboard')) return <LayoutDashboard size={16} />;
  if (l.includes('project')) return <Folder size={16} />;
  if (l.includes('team') || l.includes('user')) return <Users size={16} />;
  if (l.includes('task')) return <CheckSquare size={16} />;
  if (l.includes('kanban')) return <Columns size={16} />;
  if (l.includes('report') || l.includes('analytic')) return <BarChart2 size={16} />;
  if (l.includes('notification')) return <Bell size={16} />;
  if (l.includes('comment')) return <MessageSquare size={16} />;
  if (l.includes('attachment')) return <Paperclip size={16} />;
  return <Circle size={16} />; // Default fallback
};

export const RoleLayout = ({ roleName, navItems }: { roleName: string, navItems: NavItem[] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/users/edit/')) return 'Edit User';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/projects/new')) return 'Create Project';
    if (path.includes('/projects/edit/')) return 'Edit Project';
    if (path.includes('/projects/')) return 'Project Details';
    if (path.includes('/projects')) return 'Projects';
    if (path.includes('/tasks/new')) return 'Create Task';
    if (path.includes('/tasks/edit/')) return 'Edit Task';
    if (path.includes('/tasks/kanban')) return 'Kanban Board';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/teams/new')) return 'Add Team Member';
    if (path.includes('/teams')) return 'Teams';
    if (path.includes('/attachments')) return 'Attachments';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/dashboard')) return 'Dashboard';
    return 'Dashboard';
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Default hide on mobile
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation if on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardBg = '#f0fdf4'; // Lightish green aesthetic

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: dashboardBg }}>
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        minWidth: '260px',
        background: 'linear-gradient(180deg, #1b3222 0%, #0c1810 100%)', 
        borderRight: 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '2rem 0',
        height: '100%',
        overflowY: 'auto',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        marginLeft: isMobile ? 0 : (isSidebarOpen ? 0 : '-260px'),
      }}>
        {/* Brand / Logo */}
        <div style={{ padding: '0 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>Task System</h2>
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={20} color="#9ca3af" />
            </button>
          )}
        </div>

        {/* NAVIGATION Section */}
        <div style={{ padding: '0 1.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>NAVIGATION</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                    margin: '0 1rem',
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : '#9ca3af',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderRadius: '12px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <div style={{
                        width: '32px', height: '32px', minWidth: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive ? '#fff' : '#9ca3af'
                      }}>
                        {getIconForLabel(item.label)}
                      </div>
                      <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
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
                      margin: '0 1rem',
                      padding: '0.65rem 1rem',
                      color: isParentActive ? '#fff' : '#9ca3af',
                      background: isParentActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      borderRadius: '12px',
                      fontWeight: isParentActive ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', minWidth: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isParentActive ? '#fff' : '#9ca3af'
                    }}>
                      {getIconForLabel(item.label)}
                    </div>
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.8rem' }}>{isParentActive ? '▲' : '▼'}</span>
                  </div>
                </NavLink>

                {isParentActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.25rem', gap: '0.25rem' }}>
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        style={({ isActive }) => ({
                          position: 'relative',
                          margin: '0 1rem',
                          padding: '0.5rem 1rem 0.5rem 3.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          textDecoration: 'none',
                          color: isActive ? '#fff' : '#9ca3af',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        })}
                        end
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <div style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#34d399' }} />}
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

        {/* USER ACCOUNT Section */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <div style={{ padding: '0 1.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{user?.username?.toUpperCase() || 'USER ACCOUNT'}</span>
          </div>

          <div 
            onClick={handleLogout}
            style={{ 
              margin: '0 1rem', 
              padding: '0.65rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              color: '#9ca3af', 
              fontWeight: 500, 
              cursor: 'pointer', 
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '32px', height: '32px', minWidth: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <LogOut size={16} />
            </div>
            <span style={{ fontSize: '0.9rem' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: dashboardBg }}>
        {/* Sticky Top Header */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 30, 
          padding: '2rem 2rem 1rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(180deg, #1b3222 0%, #0c1810 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
            >
              <Menu size={24} color="#fff" />
            </button>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.75rem', color: '#fff', letterSpacing: '-0.5px' }}>{getHeaderTitle()}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NotificationBell />
          </div>
        </div>
        
        {/* Page Content */}
        <div style={{ flex: 1, padding: '1rem 2rem 2rem 2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
