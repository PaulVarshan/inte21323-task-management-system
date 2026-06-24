# Task Management System - Module Implementation Plan

This plan outlines the architecture and tasks required to build the remaining modules (Notifications & User Management) into your existing Task Management System.

## User Review Required

> [!IMPORTANT]
> Please review the architectural decisions below. In particular, note the addition of a Top Navigation Bar to the frontend layout to host the Notification Bell, and the choice of Socket.IO for real-time capabilities.

## Open Questions

> [!WARNING]
> 1. **Project Creation Notification:** When a new project is created, should we notify *all users* in the system, or just the admin and the creator? My proposal is to notify the creator and all Admins.
> 2. **Notification Bell Placement:** The current `RoleLayout` only has a left sidebar. To meet the "Notification bell in navbar" requirement, I propose adding a simple top bar to the main content area (`<div style={{ flex: 1 }}>...</div>`) to house the Bell component. Is this acceptable?

## Proposed Changes

### Module 1: Notification System (Backend)

The backend will expose a complete CRUD for notifications and emit real-time events.

#### [NEW] `backend/src/controllers/notification.controller.ts`
- Functions: `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`.

#### [NEW] `backend/src/services/notification.service.ts`
- Logic to interact with Prisma `Notification` model.
- A helper function `createNotification(userId, title, message, type)` that saves to the DB and emits a Socket.IO event to that specific user's room.

#### [NEW] `backend/src/routes/notification.routes.ts`
- Maps `GET /`, `GET /unread-count`, `PUT /:id/read`, `PUT /read-all` to the controller. Protected by `authenticate` middleware.

#### [MODIFY] Existing Services (Triggers)
- **`backend/src/services/task.service.ts`**: Inject `createNotification` calls when a task is assigned, status changes, or is completed.
- **`backend/src/services/comment.service.ts`**: Inject `createNotification` when a comment is added to a task.
- **`backend/src/services/project.service.ts`**: Inject `createNotification` when a project is created or a team member is added.

---

### Real-Time Socket.IO Integration (Bonus)

#### [MODIFY] `backend/src/server.ts` & `backend/src/app.ts`
- Install `socket.io` and configure it in `server.ts`.
- Attach the `io` instance to the global object or a singleton file so `notification.service.ts` can access it.
- Rooms will be based on `userId` so we can emit private notifications (e.g., `io.to(userId.toString()).emit('new-notification', data)`).

---

### Module 1: Notification System (Frontend)

#### [NEW] `frontend/src/components/ui/NotificationBell.tsx`
- Connects to the backend via Socket.IO client.
- Displays the unread count badge.
- Toggles the `NotificationDropdown`.

#### [NEW] `frontend/src/components/ui/NotificationDropdown.tsx`
- A dropdown displaying recent notifications, read/unread styling, and a "View All" button.

#### [NEW] `frontend/src/pages/NotificationsPage.tsx`
- Full-page view displaying all notifications, grouped by read/unread status, with title, message, and date.
- Buttons to "Mark all as read".

#### [MODIFY] `frontend/src/components/ui/RoleLayout.tsx`
- Inject a top navigation bar (or flex header) containing the `NotificationBell`.

---

### Module 2: User Management (Backend & Frontend)

#### [NEW] `backend/src/controllers/user.controller.ts`
- Functions: `getUsers`, `getUserById`, `updateUser`, `changeRole`, `changeStatus`.

#### [NEW] `backend/src/services/user.service.ts`
- Logic to query and update the `User` and `UserRole` models using Prisma.

#### [NEW] `backend/src/routes/user.routes.ts`
- Exposes user endpoints. Protected by `authenticate` AND restricted strictly to the `Admin` role.

#### [NEW] `frontend/src/pages/UsersPage.tsx`
- Table displaying Name, Email, Role, Status, Created Date.
- Action buttons: Edit, Change Role, Activate, Deactivate.
- Uses existing UI components (Tables, Buttons, Glass Panels).

#### [NEW] `frontend/src/pages/EditUserPage.tsx`
- Form to edit basic user details (Name, Email).

#### [MODIFY] `frontend/src/App.tsx` & Layouts
- Register `/admin/users` routes mapping to the new pages.
- Add `NotificationsPage` routes for all roles (`/admin/notifications`, `/pm/notifications`, `/collab/notifications`).

## Verification Plan

### Automated Tests
- Since there are no explicit tests in the repo, I will run TS compiler builds `npm run build` to verify type safety.

### Manual Verification
- Log in as Admin -> Create a project/task -> Verify another user receives the notification in real-time.
- Log in as Admin -> Access User Management -> Disable a user -> Verify they are marked INACTIVE.
- Log in as Collaborator -> Verify User Management is completely inaccessible (404/Redirect).
