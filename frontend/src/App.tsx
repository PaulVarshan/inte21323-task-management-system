
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { DashboardPage } from './pages/Dashboard';
import { AdminLoginPage } from './pages/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { PMLayout } from './layouts/PMLayout';
import { CollaboratorLayout } from './layouts/CollaboratorLayout';

// Generic Placeholders
import { ComingSoonPage } from './pages/ComingSoonPage';
import { EmptyTablePage } from './pages/EmptyTablePage';

// Project Pages (for PM use)
import { ProjectsListPage } from './pages/ProjectsListPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/adminLogin" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<ComingSoonPage title="Admin Dashboard" />} />
          <Route path="users" element={<EmptyTablePage title="User Management" columns={['Name', 'Email', 'Role', 'Status', 'Actions']} actionLabel="Create User" />} />
          <Route path="projects" element={<EmptyTablePage title="All Projects" columns={['Project Name', 'Creator', 'Status', 'Actions']} actionLabel="Create Project" />} />
          <Route path="tasks" element={<EmptyTablePage title="All Tasks" columns={['Task Title', 'Project', 'Assignee', 'Status', 'Actions']} actionLabel="Create Task" />} />
          <Route path="reports" element={<ComingSoonPage title="System Reports" />} />
          <Route path="notifications" element={<ComingSoonPage title="Notifications" />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Project Manager Routes */}
        <Route path="/pm" element={<PMLayout />}>
          <Route path="dashboard" element={<ComingSoonPage title="Project Manager Dashboard" />} />
          
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/new" element={<CreateProjectPage />} />
          <Route path="projects/edit/:id" element={<EditProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          
          <Route path="teams" element={<EmptyTablePage title="Project Teams" columns={['Project Name', 'Member', 'Role', 'Actions']} actionLabel="Add Member" />} />
          <Route path="tasks" element={<EmptyTablePage title="Project Tasks" columns={['Task Title', 'Priority', 'Due Date', 'Status', 'Actions']} actionLabel="Create Task" />} />
          <Route path="reports" element={<ComingSoonPage title="Project Reports" />} />
          <Route path="notifications" element={<ComingSoonPage title="Notifications" />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Collaborator Routes */}
        <Route path="/collaborator" element={<CollaboratorLayout />}>
          <Route path="dashboard" element={<ComingSoonPage title="Collaborator Dashboard" />} />
          <Route path="tasks" element={<EmptyTablePage title="My Tasks" columns={['Task Title', 'Project', 'Due Date', 'Status', 'Actions']} />} />
          <Route path="projects" element={<ComingSoonPage title="Project Details" />} />
          <Route path="comments" element={<ComingSoonPage title="Task Comments" />} />
          <Route path="attachments" element={<ComingSoonPage title="Attachments" />} />
          <Route path="notifications" element={<ComingSoonPage title="Notifications" />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
