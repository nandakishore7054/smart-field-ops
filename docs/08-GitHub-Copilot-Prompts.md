GitHub Copilot Implementation Prompts
Smart Field Operations & Workforce Management System
Prompt 1: Phase 1 - Project Setup & Authentication Foundation
text


Act as a Senior Full-Stack MERN Developer. 
Context: We are building the "Smart Field Operations & Workforce Management System". 
Architecture: Use a strict Feature-Based Modular Architecture (Thin Controllers, Fat Services) for the backend and Feature-Sliced Design for the React frontend. Ensure global error handling and JSend formatted API responses. 
Goal: Implement Phase 1 - Project Setup & Authentication Foundation. DO NOT implement tasks, submissions, or analytics yet.
Backend Tasks (Node/Express):
1. Setup the Express server in `/backend/src/backend.js` and `/backend/src/app.js`.
2. Configure MongoDB connection using Mongoose in `/backend/src/config/db.js`.
3. Create the `Users` Mongoose schema in `/backend/src/modules/auth/auth.model.js` (Fields: name, email, password, role enum ['admin', 'worker', 'dispatcher'], status enum ['active', 'inactive', 'on-leave']).
4. Implement `/backend/src/modules/auth/auth.service.js` with bcryptjs hashing for passwords and JWT generation (access & refresh tokens).
5. Implement `/backend/src/modules/auth/auth.controller.js` and `/backend/src/modules/auth/auth.routes.js` for:
   - POST `/api/auth/register` (Validate email format, min 8 char password)
   - POST `/api/auth/login`
   - GET `/api/auth/me` (Protected by a JWT validation middleware in `/backend/src/core/middlewares/auth.middleware.js`)
Frontend Tasks (React/Vite):
1. Setup React app in `/frontend` with Tailwind CSS and React Router DOM.
2. Create `/frontend/src/features/auth/AuthSlice.js` (or Context) to manage JWT state globally.
3. Build `/frontend/src/features/auth/Login.jsx` and `Register.jsx` with full client-side form validation.
4. Implement an Axios interceptor in `/frontend/src/app/api.js` to automatically attach the JWT to headers and handle 401s.
5. Create a `/login` and `/register` route in `/frontend/src/App.jsx`.
Produce production-quality, modular code with inline comments explaining complex logic. Ensure robust error handling (catch blocks).
---
Manual Testing Checklist:
- [ ] Server connects to MongoDB Atlas.
- [ ] Registering a user successfully encrypts the password in the DB.
- [ ] Logging in returns a valid JWT.
- [ ] Accessing `/api/auth/me` with the JWT returns the user profile.
- [ ] Submitting invalid forms on the frontend shows correct inline error states.
Acceptance Criteria:
- A user can register, log in, and their session is persisted using JWT via Axios interceptors. 
Expected Folder Changes:
/backend/src/app.js, server.js, config/db.js, core/middlewares/auth.middleware.js
/backend/src/modules/auth/* (routes, controller, service, model)
/frontend/src/App.jsx, main.jsx, app/api.js
/frontend/src/features/auth/* (Login, Register, Auth context/slice)
Prompt 2: Phase 2 - Role-Based Access Control (RBAC) & Dashboard Scaffolding
text


Act as a Senior Full-Stack MERN Developer.
Context: Building upon the Authentication foundation of the "Smart Field Operations & Workforce Management System".
Goal: Implement Phase 2 - Role-Based Access Control (RBAC) & Dashboard Scaffolding. DO NOT implement Task CRUD logic yet.
Backend Tasks:
1. Create an RBAC middleware in `/backend/src/core/middlewares/role.middleware.js` that accepts allowed roles and blocks unauthorized requests (403 Forbidden).
2. Create `/backend/src/modules/users/users.model.js` (if reusing auth model, just create the user module structure).
3. Implement `GET /api/users/workers` in the users module, returning a list of users where `role` is 'worker' and `status` is 'active'. Apply the RBAC middleware so only 'admin' or 'dispatcher' can access it.
Frontend Tasks:
1. Create a `ProtectedRoute` component in `/frontend/src/common/components/ProtectedRoute.jsx` that checks both authentication status and allowed roles.
2. Build the Admin Shell layout in `/frontend/src/common/layouts/AdminLayout.jsx` (Sidebar, Header, Main Content).
3. Build the Worker Shell layout in `/frontend/src/common/layouts/WorkerLayout.jsx` (Mobile-first Bottom Nav, Top Header).
4. Create placeholder dashboard pages in `/frontend/src/pages/admin/AdminDashboard.jsx` and `/frontend/src/pages/worker/WorkerDashboard.jsx`.
5. Update React Router in `App.jsx` to wrap these routes in the `ProtectedRoute` component appropriately.
Produce production-quality code. Keep UI components responsive (Tailwind).
---
Manual Testing Checklist:
- [ ] Admin login redirects to Admin Dashboard Layout.
- [ ] Worker login redirects to Worker Dashboard Layout.
- [ ] Worker attempting to navigate to `/admin/dashboard` is blocked and redirected.
- [ ] `GET /api/users/workers` successfully returns a list of active workers when called with an admin token.
Acceptance Criteria:
- Application successfully routes and restricts users based on their DB role. UI shells are responsive.
Expected Folder Changes:
/backend/src/core/middlewares/role.middleware.js
/backend/src/modules/users/* 
/frontend/src/common/components/ProtectedRoute.jsx
/frontend/src/common/layouts/*
/frontend/src/pages/admin/*, /frontend/src/pages/worker/*
Prompt 3: Phase 3 - Core Task Management Engine
text


Act as a Senior Full-Stack MERN Developer.
Context: Continuing the "Smart Field Operations" project. Focus strictly on Admin Task Management.
Goal: Implement Phase 3 - Core Task Management Engine. DO NOT implement worker proof submission or Cloudinary integration.
Backend Tasks:
1. Create the `Tasks` Mongoose schema in `/backend/src/modules/tasks/tasks.model.js` (Fields: title, description, priority enum, deadline, locationAddress, locationCoordinates, assignedTo (ObjectId ref), createdBy (ObjectId ref), status enum ['unassigned', 'assigned', 'in-progress', 'completed', 'verified']).
2. Implement backend validation using Zod/Joi in `/backend/src/modules/tasks/tasks.validation.js`.
3. Build the Service, Controller, and Routes for:
   - POST `/api/tasks` (Admin only)
   - GET `/api/tasks` (Admin only, implement cursor or offset pagination, filtering by status)
   - GET `/api/tasks/:id`
   - PUT `/api/tasks/:id`
   - DELETE `/api/tasks/:id` (Soft delete or physical delete)
Frontend Tasks:
1. Create `/frontend/src/features/tasks/TaskForm.jsx` allowing admins to create tasks. Fetch workers from `GET /api/users/workers` to populate the "Assignee" dropdown.
2. Create `/frontend/src/features/tasks/TaskList.jsx` displaying a paginated table of tasks.
3. Integrate these components into a new page `/frontend/src/pages/admin/DispatchBoard.jsx`.
4. Ensure robust error handling and loading skeletons while data fetches.
---
Manual Testing Checklist:
- [ ] Admin can create a task with validation preventing empty titles or past deadlines.
- [ ] Tasks are saved to MongoDB with correct assignedTo ObjectIds.
- [ ] Admin can view a paginated list of tasks on the Dispatch Board.
- [ ] Admin can delete/update a task.
Acceptance Criteria:
- Admins have full CRUD capability over tasks.
Expected Folder Changes:
/backend/src/modules/tasks/*
/frontend/src/features/tasks/* (Form, List components)
/frontend/src/pages/admin/DispatchBoard.jsx
Prompt 4: Phase 4 - Field Worker Execution & Offline Resilience
text


Act as a Senior Full-Stack MERN Developer.
Context: "Smart Field Operations" project. Focus on the Worker's experience and status progression.
Goal: Implement Phase 4 - Field Worker Execution & Offline Resilience. DO NOT implement image uploads yet.
Backend Tasks:
1. In the `tasks` module, implement `GET /api/tasks/my-tasks`. Filter tasks where `assignedTo` matches the `req.user.id` (extracted from JWT).
2. Implement `PATCH /api/tasks/:id/status`. Ensure strict validation in the Service layer so a worker can only update tasks assigned to them, and enforce valid state transitions (e.g., 'assigned' -> 'in-progress').
Frontend Tasks:
1. Create `/frontend/src/features/tasks/WorkerTaskList.jsx` to render mobile-friendly task cards.
2. Create `/frontend/src/features/tasks/WorkerTaskDetail.jsx` displaying full task info and a "Start Task" button that triggers the `PATCH` status endpoint.
3. Integrate these into `/frontend/src/pages/worker/WorkerDashboard.jsx` and `/frontend/src/pages/worker/TaskDetail.jsx`.
4. Configure Vite to enable basic Progressive Web App (PWA) capabilities (`vite-plugin-pwa`) to cache the application shell and allow the app to load visually when offline.
---
Manual Testing Checklist:
- [ ] Worker logs in and only sees tasks assigned to them.
- [ ] Worker clicks "Start Task", status successfully updates to "in-progress" in DB.
- [ ] Attempting to update a task assigned to someone else returns 403.
- [ ] Disconnecting the network still allows the web app UI to load (PWA caching).
Acceptance Criteria:
- Field workers can view their itinerary and progress task states securely.
Expected Folder Changes:
/backend/src/modules/tasks/tasks.controller.js & .service.js (New endpoints)
/frontend/vite.config.js (PWA config)
/frontend/src/features/tasks/* (Worker components)
/frontend/src/pages/worker/*
Prompt 5: Phase 5 - Proof of Work & Verification System
text


Act as a Senior Full-Stack MERN Developer.
Context: "Smart Field Operations" project. Focus on file handling, geolocation, and admin verification.
Goal: Implement Phase 5 - Proof of Work & Verification System.
Backend Tasks:
1. Setup Cloudinary SDK in `/backend/src/config/cloudinary.js`.
2. Implement `/backend/src/modules/submissions/` module.
3. Create `GET /api/upload/signature` to generate secure Cloudinary upload signatures.
4. Create the `Submissions` Mongoose schema (taskId, workerId, images array, notes, submittedLocation GeoJSON, isVerified, verifiedBy, verificationFeedback).
5. Implement `POST /api/submissions` allowing workers to submit proof. This should also automatically update the associated Task status to 'completed'.
6. Implement `PATCH /api/tasks/:id/verify` (Admin only) to approve/reject the submission and update task status to 'verified' or 'rejected'.
Frontend Tasks:
1. Build `/frontend/src/features/submissions/ProofSubmissionForm.jsx`. Include an image uploader, a text area for notes, and use the HTML5 Geolocation API to capture coordinates on submit. 
2. Use `browser-image-compression` before requesting the Cloudinary signature and uploading directly from the client.
3. Build `/frontend/src/features/submissions/AdminVerificationView.jsx` allowing admins to view the images, notes, and a map link, with "Approve" and "Reject" buttons.
---
Manual Testing Checklist:
- [ ] Worker form captures GPS coordinates via browser prompt.
- [ ] Image compresses and uploads successfully to Cloudinary; URL saves to MongoDB.
- [ ] Task status changes to 'completed' upon submission.
- [ ] Admin clicks "Approve" and task status changes to 'verified'.
Acceptance Criteria:
- End-to-end digital paper trail is established with media uploads and admin sign-off.
Expected Folder Changes:
/backend/src/config/cloudinary.js
/backend/src/modules/submissions/*
/frontend/src/features/submissions/*
Prompt 6: Phase 6 - Real-Time Updates & Notifications
text


Act as a Senior Full-Stack MERN Developer.
Context: "Smart Field Operations" project. Focus on real-time sockets and emails.
Goal: Implement Phase 6 - Real-Time Updates & Notifications. 
Backend Tasks:
1. Setup Socket.IO on the Express server in `server.js`. Implement room logic (users join a room based on their `_id` and a general `admin` room).
2. Configure Nodemailer in `/backend/src/config/mailer.js`.
3. Create the `Notifications` Mongoose schema (userId, message, type, relatedTaskId, isRead boolean) in the `/backend/src/modules/notifications/` module.
4. Update the Task Service (`createTask`, `verifyTask`) and Submission Service (`createSubmission`) to:
   - Save a Notification document.
   - Emit Socket.IO events (`task:created`, `submission:created`).
   - Send transactional emails via Nodemailer (e.g., "New Task Assigned").
5. Implement `GET /api/notifications` and `PATCH /api/notifications/:id/read`.
Frontend Tasks:
1. Setup Socket.IO client in `/frontend/src/app/socket.js`.
2. Implement a `NotificationDropdown.jsx` in the shared Navbar to poll/listen for alerts.
3. Update the Admin `DispatchBoard.jsx` to listen for `submission:created` and dynamically update the table without a page refresh.
4. Implement React Hot Toast for popup alerts when socket events are received.
---
Manual Testing Checklist:
- [ ] Creating a task sends an email to the assigned worker's address.
- [ ] Worker submitting proof instantly updates the Admin's dashboard table via WebSocket.
- [ ] Bell icon in the navbar shows an unread badge that clears when clicked.
Acceptance Criteria:
- System provides instant feedback across browsers without manual reloading.
Expected Folder Changes:
/backend/src/backend.js (Socket setup)
/backend/src/config/mailer.js
/backend/src/modules/notifications/*
/frontend/src/app/socket.js
/frontend/src/common/components/NotificationDropdown.jsx
Prompt 7: Phase 7 - Analytics, Hardening & Deployment
text


Act as a Senior Full-Stack MERN Developer.
Context: "Smart Field Operations" project. Focus on management reporting and production readiness.
Goal: Implement Phase 7 - Analytics, Hardening & Deployment.
Backend Tasks:
1. Create `/backend/src/modules/analytics/` module.
2. Implement `GET /api/analytics/summary` using MongoDB Aggregation Pipelines to calculate:
   - Total tasks, Completed tasks, Pending tasks, Overdue tasks.
   - Task completion rate.
3. Harden the API: Ensure `helmet` and `cors` are strictly configured. Ensure all routes validate inputs. Apply `.lean()` to Mongoose GET queries for performance. Create indexes on `assignedTo`, `status`, and `deadline` across collections.
Frontend Tasks:
1. Install `recharts` (or `chart.js`).
2. Build `/frontend/src/features/analytics/AnalyticsDashboard.jsx` featuring KPI summary cards and a pie chart showing task status distribution.
3. Integrate this into `/frontend/src/pages/admin/AdminDashboard.jsx`.
4. Perform a final UI audit for mobile responsiveness, ensuring forms and tables don't break on small screens. Handle empty states gracefully.
---
Manual Testing Checklist:
- [ ] Analytics dashboard accurately reflects the counts in the database.
- [ ] Charts render correctly and resize on mobile devices.
- [ ] API rejects requests from unauthorized CORS origins.
- [ ] Production build (`npm run build`) compiles successfully with no ESLint errors.
Acceptance Criteria:
- System provides actionable business intelligence, is secure, and is ready for cloud deployment (Vercel/Render).
Expected Folder Changes:
/backend/src/modules/analytics/*
/backend/src/app.js (Security middlewares)
/frontend/src/features/analytics/*
/frontend/src/pages/admin/AdminDashboard.jsx