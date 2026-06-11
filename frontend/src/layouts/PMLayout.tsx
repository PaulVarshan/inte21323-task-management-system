import { RoleLayout } from '../components/ui/RoleLayout';

export const PMLayout = () => {
  const navItems = [
    { path: '/pm/dashboard', label: 'Dashboard' },
    { path: '/pm/projects', label: 'My Projects' },
    { path: '/pm/teams', label: 'Project Teams' },
    { path: '/pm/tasks', label: 'Tasks' },
    { path: '/pm/reports', label: 'Reports' },
    { path: '/pm/notifications', label: 'Notifications' },
  ];

  return <RoleLayout roleName="Project Manager" navItems={navItems} />;
};
