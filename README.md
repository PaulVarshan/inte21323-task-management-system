# Task Management System

## 📖 Project Overview
The Task Management System is a comprehensive, full-stack web application designed to facilitate team collaboration, project tracking, and task management. It provides role-based access control, allowing Administrators, Project Managers, and Collaborators to seamlessly interact in a shared workspace. Features include real-time notifications, interactive Kanban boards, dashboard analytics, file attachments, and threaded comments.

## 🚀 Technologies Used

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Headless UI
- **State Management & Data Fetching**: React Hooks, Axios
- **Real-time Communication**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens) via HttpOnly Cookies, bcrypt
- **Real-time Communication**: Socket.IO
- **File Storage**: AWS S3 Compatible Storage (Supabase Storage)
- **API Documentation**: Swagger UI

### Infrastructure & Deployment
- **Database**: PostgreSQL (hosted on Supabase)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Amazon Web Services (AWS EC2)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (optional, for containerized setup)
- PostgreSQL Database (or a Supabase account)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/superjack2k4/inte21323-task-management-system.git
   cd task-management-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   DATABASE_URL="your_postgresql_connection_string"
   DIRECT_URL="your_direct_postgresql_connection_string"
   JWT_SECRET="your_jwt_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   FRONTEND_URL="http://localhost:5173"
   S3_ACCESS_KEY_ID="your_s3_key"
   S3_SECRET_ACCESS_KEY="your_s3_secret"
   S3_ENDPOINT="your_s3_endpoint"
   S3_REGION="your_s3_region"
   S3_BUCKET_NAME="your_bucket_name"
   ```
   Generate the Prisma client and push the schema to the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api/auth
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

### Docker Production Setup
To run the entire application using Docker Compose:
```bash
# Add your production .env files into frontend/ and backend/ directories first
docker compose up -d --build
```
The application will be accessible at `http://localhost`.

## 📚 API Usage

The backend API is fully documented using Swagger UI. Once the backend server is running, you can explore the API endpoints, view request/response schemas, and test the endpoints directly from your browser.

**Swagger UI URL:**
`http://16.171.216.35:5000/api-docs/#/Authentication/post_api_auth_login`


## 👥 Team Member Contributions

### Gowthaman – Member 1 (Authentication & Authorization)
- Set up the initial project architecture and integrated the frontend and backend.
- Implemented secure user authentication using JWT with HttpOnly cookies.
- Developed user registration, login, logout, and session validation.
- Configured password hashing and authentication middleware.
- Implemented Role-Based Access Control (RBAC) for Admin, Project Manager, and Collaborator roles.
- Protected frontend routes and backend APIs.
- Configured Prisma ORM with Supabase PostgreSQL.
- Integrated authentication APIs with the frontend.

---

### Paul Anthony – Member 2 (Project & Team Management)
- Developed the complete Project Management module.
- Implemented CRUD operations for projects.
- Built the Project Team Management system.
- Added functionality to add, remove, and manage project members.
- Implemented project role management (INCHARGE and MEMBER).
- Added project validation and permission checks.
- Developed Project List, Create Project, Edit Project, and Project Details pages.
- Integrated project management APIs with the frontend.
- Implemented role-based project access control.

---

### Malporu – Member 3 (Task Management)
- Developed the Task Management module.
- Implemented task creation, updating, assignment, and management features.
- Built the Kanban Board for visual task tracking.
- Added task filtering and priority sorting.
- Implemented task status management.
- Added role-based task visibility and permissions.
- Improved task assignment workflows.
- Enhanced project member management functionality.
- Implemented additional permission validation and task management improvements.

---

### Lavinidi – Member 4 (Collaboration & Dashboard Analytics)
- Developed the Dashboard Analytics module.
- Implemented project progress and task statistics.
- Added dashboard widgets including:
  - Overview statistics
  - Project progress
  - Task status distribution
  - Overdue tasks
  - Upcoming deadlines
  - Team workload
  - Recent tasks
- Developed the Comments module with full CRUD functionality.
- Implemented the Attachment Management module with file upload and deletion support.
- Integrated dashboard analytics into the Admin and Project Manager dashboards.
- Added additional validation and user experience improvements.

---

### Sanadi – Member 5 (Notifications & User Management)
- Developed the Notification Management module.
- Implemented notification CRUD operations.
- Added automatic notifications for:
  - Project creation
  - Project member assignment
  - Task assignment
  - Task status updates
  - Task completion
  - Comment creation
- Developed the notification panel with unread notification counter.
- Implemented mark-as-read and mark-all-as-read functionality.
- Integrated real-time notifications using Socket.IO.
- Developed the User Management module for administrators.
- Implemented user role management and account activation/deactivation.
- Completed final integration of notification and user management features across the application.
