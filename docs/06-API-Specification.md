REST API Specification Document
Smart Field Operations & Workforce Management System
1. Global API Standards
Pagination, Filtering, and Sorting
Pagination: Handled via Cursor-based pagination for performance, with a fallback to Offset-based for simpler admin tables.
Query Params: limit (default: 20), cursor (last seen _id), page (for offset fallback).
Filtering: Handled via URL query parameters (e.g., ?status=in-progress&priority=high).
Sorting: Handled via the sort query parameter (e.g., ?sort=-createdAt for descending, ?sort=deadline for ascending).
Real-Time Communication (Socket.IO Events)
Emitted by Server:
task:created (Sent to specific worker room).
task:updated (Sent to specific worker room & admin dashboard room).
submission:created (Sent to admin dashboard room).
Listened by Server:
join:room (User joins their specific ID room or 'admin' room upon connecting).
Email Notifications (Nodemailer)
Triggers:
New User Registration (Welcome Email).
Task Assigned to Worker (Assignment Email with details).
Task Verified/Rejected (Feedback Email to Worker).
Response Envelope (JSend Format)
Success: { "status": "success", "data": { ... } }
Error: { "status": "error", "message": "Reason" }
Fail (Validation): { "status": "fail", "data": { "field": "validation error message" } }
2. API Endpoints
2.1 Authentication Module
Register User
Module: Auth | Feature: Registration
HTTP Method: POST | URL: /api/auth/register
Purpose: Create a new user account.
Authentication: None | Authorization: None
Request Body: { "name": "...", "email": "...", "password": "...", "role": "admin|worker" }
Validation Rules: Valid email format, password min 8 chars, valid role enum.
Success Response: 201 Created | { "status": "success", "data": { "user": {}, "accessToken": "...", "refreshToken": "..." } }
Error Responses: 400 Bad Request (Validation fail), 409 Conflict (Email exists).
Frontend Page: /register
Collections Involved: Users
Notifications: Triggers Welcome Email.
Login User
Module: Auth | Feature: Login
HTTP Method: POST | URL: /api/auth/login
Purpose: Authenticate user and return JWTs.
Authentication: None | Authorization: None
Request Body: { "email": "...", "password": "..." }
Validation Rules: Both fields required.
Success Response: 200 OK | { "status": "success", "data": { "user": {}, "accessToken": "...", "refreshToken": "..." } }
Error Responses: 401 Unauthorized (Invalid credentials).
Frontend Page: /login
Collections Involved: Users
Get Current User (Me)
Module: Auth | Feature: Session Validation
HTTP Method: GET | URL: /api/auth/me
Purpose: Validate JWT on page refresh and fetch profile.
Authentication: Required (Bearer Token) | Authorization: Any Role
Success Response: 200 OK | { "status": "success", "data": { "user": {} } }
Error Responses: 401 Unauthorized (Token missing/expired).
Frontend Page: Global App Wrapper (Runs on load).
Collections Involved: Users
2.2 Users Module
Get Field Workers
Module: Users | Feature: Worker Listing
HTTP Method: GET | URL: /api/users/workers
Purpose: Fetch a list of active workers for task assignment dropdowns.
Authentication: Required | Authorization: Admin Only
Query Parameters: status=active (Optional filter)
Success Response: 200 OK | { "status": "success", "data": { "workers": [...] } }
Error Responses: 403 Forbidden
Frontend Page: Admin Task Creation /admin/tasks/new
Collections Involved: Users
2.3 Tasks Module
Create Task
Module: Tasks | Feature: Task Creation
HTTP Method: POST | URL: /api/tasks
Purpose: Create a new work order and optionally assign it.
Authentication: Required | Authorization: Admin Only
Request Body: { "title": "...", "description": "...", "priority": "high", "deadline": "2026-10-01", "locationAddress": "...", "assignedTo": "objectId" }
Validation Rules: Title required, valid priority enum, deadline in future.
Success Response: 201 Created | { "status": "success", "data": { "task": {} } }
Error Responses: 400 Bad Request (Validation fail).
Frontend Page: Admin Dashboard /admin/tasks/new
Collections Involved: Tasks, Users, Notifications
Socket.IO: Emits task:created to assigned worker's room.
Notifications: Triggers Assignment Email to worker; inserts Notification record.
Get All Tasks
Module: Tasks | Feature: Admin Task List
HTTP Method: GET | URL: /api/tasks
Purpose: Fetch paginated, filterable list of all tasks.
Authentication: Required | Authorization: Admin Only
Query Parameters: page, limit, status, priority, sort
Success Response: 200 OK | { "status": "success", "data": { "tasks": [...], "pagination": {} } }
Frontend Page: Admin Dashboard /admin/tasks
Collections Involved: Tasks
Get Worker's Tasks
Module: Tasks | Feature: Worker Itinerary
HTTP Method: GET | URL: /api/tasks/my-tasks
Purpose: Fetch tasks assigned specifically to the logged-in worker.
Authentication: Required | Authorization: Worker Only
Query Parameters: status, sort
Success Response: 200 OK | { "status": "success", "data": { "tasks": [...] } }
Frontend Page: Worker Dashboard /worker/dashboard
Collections Involved: Tasks
Update Task Status (Worker)
Module: Tasks | Feature: State Progression
HTTP Method: PATCH | URL: /api/tasks/:id/status
Purpose: Worker updates a task (e.g., Assigned -> In Progress).
Authentication: Required | Authorization: Worker Only
Parameters: id (Task ID in path)
Request Body: { "status": "in-progress" }
Validation Rules: Status must be valid enum. Worker must be the assigned user. Cannot jump states illegally (e.g., Assigned directly to Verified).
Success Response: 200 OK | { "status": "success", "data": { "task": {} } }
Error Responses: 403 Forbidden (Not assigned to this task), 400 Bad Request (Invalid state transition).
Frontend Page: Worker Task Detail /worker/tasks/:id
Collections Involved: Tasks
Socket.IO: Emits task:updated to admin room.
2.4 Submissions Module
Get Upload Signature
Module: Submissions | Feature: Secure Media Upload
HTTP Method: GET | URL: /api/upload/signature
Purpose: Return a secure Cloudinary signature so the frontend can upload images directly to Cloudinary without routing heavy files through our Node server.
Authentication: Required | Authorization: Any Role
Success Response: 200 OK | { "status": "success", "data": { "signature": "...", "timestamp": 12345 } }
Frontend Page: Worker Proof Submission Form.
Submit Proof of Work
Module: Submissions | Feature: Task Completion
HTTP Method: POST | URL: /api/submissions
Purpose: Worker submits final notes, location, and image URLs to complete a task.
Authentication: Required | Authorization: Worker Only
Request Body: { "taskId": "...", "images": ["url1"], "notes": "...", "submittedLocation": { "type": "Point", "coordinates": [long, lat] } }
Validation Rules: Must provide at least one image or note. Task must be in "in-progress" state.
Success Response: 201 Created | { "status": "success", "data": { "submission": {} } }
Error Responses: 400 Bad Request (Task already completed/verified).
Frontend Page: Worker Task Detail /worker/tasks/:id/submit
Collections Involved: Submissions, Tasks (Updates task status to "completed").
Socket.IO: Emits submission:created to admin room.
Verify Task (Admin)
Module: Tasks/Submissions | Feature: Admin Sign-off
HTTP Method: PATCH | URL: /api/tasks/:id/verify
Purpose: Admin reviews a submission and approves or rejects the task.
Authentication: Required | Authorization: Admin Only
Parameters: id (Task ID)
Request Body: { "isVerified": true, "verificationFeedback": "Good job" }
Validation Rules: Boolean required.
Success Response: 200 OK | { "status": "success", "data": { "task": {} } }
Collections Involved: Tasks (Updates status to verified/rejected), Submissions (Updates verifiedBy), Notifications.
Notifications: Triggers Email and Notification to worker.
2.5 Notifications Module
Get My Notifications
Module: Notifications | Feature: Alert Center
HTTP Method: GET | URL: /api/notifications
Purpose: Fetch unread and recent notifications for the logged-in user.
Authentication: Required | Authorization: Any Role
Query Parameters: isRead=false (To fetch only unread).
Success Response: 200 OK | { "status": "success", "data": { "notifications": [...] } }
Frontend Page: Global Navigation Bar (Notification Bell icon).
Collections Involved: Notifications
Mark Notification as Read
Module: Notifications | Feature: Alert Center
HTTP Method: PATCH | URL: /api/notifications/:id/read
Authentication: Required | Authorization: Any Role
Success Response: 200 OK | { "status": "success", "data": { "notification": {} } }
Collections Involved: Notifications
2.6 Analytics Module
Get Dashboard Summary
Module: Analytics | Feature: Management Dashboard
HTTP Method: GET | URL: /api/analytics/summary
Purpose: Run MongoDB Aggregation pipelines to return top-level KPIs.
Authentication: Required | Authorization: Admin Only
Query Parameters: dateRange (e.g., 'last7days', 'thisMonth').
Success Response: 200 OK
json


{
  "status": "success",
  "data": {
    "totalTasks": 150,
    "completed": 120,
    "pending": 25,
    "overdue": 5,
    "topWorkers": [...]
  }
}
Frontend Page: Admin Dashboard /admin/dashboard
Collections Involved: Tasks, Users, Submissions (Via Aggregation).