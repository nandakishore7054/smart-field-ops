# Role & Permission Matrix

## Smart Field Operations & Workforce Management System

> **Document 13 of 20** · Enterprise Architecture Series

---

## 1. Purpose

Definitive RBAC reference for every module, API endpoint, and frontend route — current and future. Implement `requireRoles()` calls directly from this document.

---

## 2. Roles

### Current

| Role | Scope | Default Redirect |
|------|-------|------------------|
| **Admin** | Full system access | `/admin/dashboard` |
| **Dispatcher** | Task operations only | `/admin/dispatch-board` |
| **Worker** | Own tasks and profile only | `/worker/dashboard` |

### Future

| Role | Scope | Phase |
|------|-------|-------|
| **Manager** | Team oversight (own workers only) | Phase 10 |
| **HR** | Workforce management (availability, attendance, payroll) | Phase 10 |
| **Auditor** | Read-only access to all records | Phase 12 |

---

## 3. Permission Matrix

Legend: ✅ Allowed · ❌ Denied · 🔶 Own only · 📋 Team only

### Authentication

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| Register | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Get session (me) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Refresh token | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Users

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View all users | ✅ | ❌ | ❌ | 📋 | ✅ | ✅ |
| View workers list | ✅ | ✅ | ❌ | 📋 | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change user role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change user status | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Tasks

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View all tasks | ✅ | ✅ | ❌ | 📋 | ❌ | ✅ |
| View own tasks | — | — | ✅ | — | — | — |
| Create task | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update task | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update task status | ❌ | ❌ | 🔶 | ❌ | ❌ | ❌ |
| Assign worker | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Verify/reject proof | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete task | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Submissions

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| Submit proof | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Get upload signature | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View submissions | ✅ | ✅ | 🔶 | 📋 | ❌ | ✅ |

### Notifications

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View own notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Analytics

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View summary dashboard | ✅ | ❌ | ❌ | 📋 | ❌ | ✅ |
| View worker stats | ✅ | ❌ | ❌ | 📋 | ❌ | ✅ |
| Export reports | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Availability (Phase 9)

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View all schedules | ✅ | ✅ | ❌ | 📋 | ✅ | ✅ |
| Set own availability | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Set worker availability | ✅ | ❌ | ❌ | 📋 | ✅ | ❌ |
| Submit leave request | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve leave | ✅ | ❌ | ❌ | 📋 | ✅ | ❌ |

### Attendance (Phase 10)

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View all records | ✅ | ❌ | ❌ | 📋 | ✅ | ✅ |
| View own records | — | — | ✅ | — | — | — |
| Check in / check out | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manual override | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage shifts | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Live Tracking (Phase 11)

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View live map | ✅ | ✅ | ❌ | 📋 | ❌ | ❌ |
| Send location | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage geofences | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View routes | ✅ | ✅ | 🔶 | 📋 | ❌ | ✅ |

### AI Intelligence (Phase 13)

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View recommendations | ✅ | ✅ | ❌ | 📋 | ❌ | ❌ |
| Accept/reject suggestion | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI chat assistant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Payroll (Phase 14)

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| View all payroll | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View own payslips | — | — | ✅ | — | — | — |
| Calculate payroll | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Approve payroll | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Settings

| Action | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|--------|-------|------------|--------|---------|-----|---------|
| Own profile & theme | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Route Access

### Current Routes

| Route | Admin | Dispatcher | Worker |
|-------|-------|------------|--------|
| `/` | ✅ | ✅ | ✅ |
| `/login`, `/register` | Public | Public | Public |
| `/admin/dashboard` | ✅ | ❌ | ❌ |
| `/admin/dispatch-board` | ✅ | ✅ | ❌ |
| `/admin/users` | ✅ | ❌ | ❌ |
| `/admin/settings` | ✅ | ✅ | ❌ |
| `/worker/dashboard` | ❌ | ❌ | ✅ |
| `/worker/tasks/:id` | ❌ | ❌ | ✅ |
| `/worker/settings` | ❌ | ❌ | ✅ |

### Future Routes

| Route | Admin | Dispatcher | Worker | Manager | HR | Auditor |
|-------|-------|------------|--------|---------|-----|---------|
| `/admin/availability` | ✅ | ✅ | ❌ | 📋 | ✅ | ✅ |
| `/worker/my-availability` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/admin/attendance` | ✅ | ❌ | ❌ | 📋 | ✅ | ✅ |
| `/worker/check-in` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/admin/live-tracking` | ✅ | ✅ | ❌ | 📋 | ❌ | ❌ |
| `/admin/geofences` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/advanced-analytics` | ✅ | ❌ | ❌ | 📋 | ❌ | ✅ |
| `/admin/ai-insights` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/admin/payroll` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/worker/my-payslips` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 5. API Authorization Summary

Middleware format: `requireRoles('role1', 'role2')`

| Module | Endpoint Pattern | Middleware |
|--------|-----------------|------------|
| **Auth** | All auth routes | No role check (public or `protect` only) |
| **Users** | `PUT /me` | `protect` (any authenticated) |
| **Users** | `GET /workers` | `requireRoles('admin', 'dispatcher')` |
| **Users** | `GET /`, `PUT /:id/status`, `PUT /:id/role` | `requireRoles('admin')` |
| **Tasks** | `GET /my-tasks`, `PATCH /:id/status` | `requireRoles('worker')` |
| **Tasks** | `POST /`, `GET /`, `GET /:id`, `PUT /:id` | `requireRoles('admin', 'dispatcher')` |
| **Tasks** | `PATCH /:id/verify`, `DELETE /:id` | `requireRoles('admin')` |
| **Submissions** | `POST /submissions` | `requireRoles('worker')` |
| **Submissions** | `GET /upload/signature` | `protect` (any authenticated) |
| **Notifications** | All | `protect` (any authenticated) |
| **Analytics** | All | `requireRoles('admin')` |
| **Availability** *(P9)* | Worker self-manage | `requireRoles('worker')` |
| **Availability** *(P9)* | Admin view/manage | `requireRoles('admin', 'dispatcher')` |
| **Availability** *(P9)* | Leave approval | `requireRoles('admin')` |
| **Attendance** *(P10)* | Check in/out | `requireRoles('worker')` |
| **Attendance** *(P10)* | View all, manage shifts | `requireRoles('admin')` |
| **Tracking** *(P11)* | Send location | `requireRoles('worker')` |
| **Tracking** *(P11)* | Live map, routes | `requireRoles('admin', 'dispatcher')` |
| **Tracking** *(P11)* | Geofence CRUD | `requireRoles('admin')` |
| **AI** *(P13)* | View/accept recommendations | `requireRoles('admin', 'dispatcher')` |
| **AI** *(P13)* | Chat assistant | `requireRoles('admin')` |
| **Payroll** *(P14)* | View own payslips | `requireRoles('worker')` |
| **Payroll** *(P14)* | Calculate | `requireRoles('admin')` |
| **Payroll** *(P14)* | Approve | `requireRoles('admin')` |

---

## 6. Future Notes

- **Manager role** introduces team-scoping: add `teamId` or `managerId` to Users, filter all queries by team membership
- **HR role** is functionally similar to Admin for workforce modules but has zero access to task operations
- **Auditor role** is strictly read-only — enforce by omitting from all write-method `requireRoles()` calls
- When Manager/HR/Auditor are introduced, update `role.middleware.js` enum validation — no structural changes needed since `requireRoles()` already accepts variadic arguments
- Consider migrating to a permission-based system (`can('tasks:create')`) instead of role-based if more than 6 roles are needed

---

*Last updated: July 2026*
