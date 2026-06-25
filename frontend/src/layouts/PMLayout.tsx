import { RoleLayout } from '../components/ui/RoleLayout';

export const PMLayout = () => {
  const navItems = [
    { path: '/pm/dashboard', label: 'Dashboard' },
    { path: '/pm/projects', label: 'My Projects' },
    { path: '/pm/teams', label: 'Project Teams' },
  //  { path: '/pm/tasks', label: 'Tasks' },
    { path: '/pm/tasks',
      label: 'Tasks',
      children: [
        { path: '/pm/tasks', label: '≡  List View' },
        { path: '/pm/tasks/kanban', label: '⊞  Kanban Board' },
      ]
    },
  //  { path: '/pm/tasks/kanban', label: 'Kanban Board' },

    { path: '/pm/notifications', label: 'Notifications' },
  ];

  return <RoleLayout roleName="Project Manager" navItems={navItems} />;
};
