import { RoleLayout } from '../components/ui/RoleLayout';

export const AdminLayout = () => {
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/projects', label: 'Project Management' },
//  { path: '/admin/tasks', label: 'Task Management' },
    {
      path: '/admin/tasks',
      label: 'Task Management',
      children: [
        { path: '/admin/tasks', label: '≡  List View' },
        { path: '/admin/tasks/kanban', label: '⊞  Kanban Board' },
      ]
    },
    { path: '/admin/tasks/kanban', label: 'Kanban Board' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/notifications', label: 'Notifications' },
  ];

  return <RoleLayout roleName="Admin" navItems={navItems} />;
};
