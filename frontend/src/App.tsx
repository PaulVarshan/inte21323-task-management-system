
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
// removed unused import

// New Modules
import { UsersPage } from './pages/UsersPage';
import { EditUserPage } from './pages/EditUserPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AttachmentsPage } from './pages/AttachmentsPage';

// Project Pages (for PM use)
import { ProjectsListPage } from './pages/ProjectsListPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PMDashboard } from './pages/PMDashboard';
import { CollaboratorDashboard } from './pages/CollaboratorDashboard';

// Tasks and Teams Pages
import { TasksListPage } from './pages/TasksListPage';
import { CreateTaskPage } from './pages/CreateTaskPage';
import { EditTaskPage } from './pages/EditTaskPage';
import { KanbanBoard } from './pages/KanbanBoard';
import { TeamsListPage } from './pages/TeamsListPage';
import { AddTeamMemberPage } from './pages/AddTeamMemberPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/adminLogin" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<PMDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/edit/:id" element={<EditUserPage />} />
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/new" element={<CreateProjectPage />} />
          <Route path="projects/edit/:id" element={<EditProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          
          <Route path="tasks" element={<TasksListPage />} />
          <Route path="tasks/new" element={<CreateTaskPage />} />
          <Route path="tasks/edit/:id" element={<EditTaskPage />} />
          <Route path="tasks/kanban" element={<KanbanBoard />} />
          <Route path="attachments" element={<AttachmentsPage />} />


          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Project Manager Routes */}
        <Route path="/pm" element={<PMLayout />}>
          <Route path="dashboard" element={<PMDashboard />} />
          
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/new" element={<CreateProjectPage />} />
          <Route path="projects/edit/:id" element={<EditProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          
          <Route path="teams" element={<TeamsListPage />} />
          <Route path="teams/new" element={<AddTeamMemberPage />} />
          
          <Route path="tasks" element={<TasksListPage />} />
          <Route path="tasks/new" element={<CreateTaskPage />} />
          <Route path="tasks/edit/:id" element={<EditTaskPage />} />
          <Route path="tasks/kanban" element={<KanbanBoard />} />
          <Route path="attachments" element={<AttachmentsPage />} />


          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Collaborator Routes */}
        <Route path="/collaborator" element={<CollaboratorLayout />}>
          <Route path="dashboard" element={<CollaboratorDashboard />} />
          
          <Route path="tasks" element={<TasksListPage />} />
          <Route path="tasks/edit/:id" element={<EditTaskPage />} />
          <Route path="tasks/kanban" element={<KanbanBoard />} />
          
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          
          <Route path="comments" element={<ComingSoonPage title="Task Comments" />} />
          <Route path="attachments" element={<AttachmentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
