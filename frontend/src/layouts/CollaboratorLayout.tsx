import { RoleLayout } from '../components/ui/RoleLayout';

export const CollaboratorLayout = () => {
  const navItems = [
    { path: '/collaborator/dashboard', label: 'Dashboard' },
    { path: '/collaborator/tasks', label: 'My Tasks' },
    { path: '/collaborator/projects', label: 'Project Details' },
    { path: '/collaborator/comments', label: 'Comments' },
    { path: '/collaborator/attachments', label: 'Attachments' },
    { path: '/collaborator/notifications', label: 'Notifications' },
  ];

  return <RoleLayout roleName="Collaborator" navItems={navItems} />;
};
