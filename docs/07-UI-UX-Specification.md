UI/UX Specification Document
Smart Field Operations & Workforce Management System
1. Authentication Pages
1.1 Login Page
Purpose: Authenticate users and direct them to their respective role-based dashboards.
Route: /login
User Role: Unauthenticated
Layout: Centered single-column card layout on a branded background.
Components:
Forms: Email and Password input fields.
Buttons: "Sign In" (Primary), "Forgot Password?" (Text link).
Validation: Client-side required field checks, valid email format check.
States:
Loading State: "Sign In" button shows a spinner; inputs are disabled.
Error State: Inline red text below inputs for validation; Toast notification for invalid credentials.
Success Messages: Brief Toast "Login successful" before redirect.
Responsive Behavior: Full-width inputs on mobile; card centered on tablet/desktop.
APIs Consumed: POST /api/auth/login
Navigation Flow: On success -> Redirect to /admin/dashboard (Admin), /manager/tasks (Manager), or /worker/dashboard (Worker).
1.2 Registration Page
Purpose: Allow new users to create an account.
Route: /register
User Role: Unauthenticated
Layout: Centered single-column card layout.
Components:
Forms: Full Name, Email, Password, Confirm Password, Role Dropdown (Admin/Manager/Worker).
Buttons: "Create Account" (Primary), "Already have an account? Sign in" (Text link).
Validation: Password match validation, strong password requirements, required fields.
States:
Loading State: Button spinner.
Error State: Inline validation errors.
Responsive Behavior: Same as Login.
APIs Consumed: POST /api/auth/register
Navigation Flow: On success -> Redirect to /login with success toast.
2. Admin Pages
2.1 Analytics Dashboard
Purpose: Provide a high-level overview of organizational health and workforce efficiency.
Route: /admin/dashboard
User Role: Admin
Layout: Admin Shell (Left Sidebar, Top Navbar with notifications, Main Content Area).
Components:
Cards: KPI Summary Cards (Total Tasks, Completion Rate, Overdue Tasks, Active Workers).
Charts: Bar chart (Tasks completed this week vs last week), Pie chart (Task distribution by status).
Filters: Date Range Picker (Today, This Week, This Month).
States:
Loading State: Skeleton loaders for KPI cards and charts.
Error State: "Failed to load dashboard data" banner with a "Retry" button.
Empty State: Charts display "No data available for this date range."
Responsive Behavior: Grid layout (4 columns on desktop, 2 on tablet, 1 on mobile). Sidebar collapses to a hamburger menu on mobile.
APIs Consumed: GET /api/analytics/summary
Navigation Flow: Click on "Overdue Tasks" card -> Redirects to Task Management pre-filtered.
2.2 User Management
Purpose: Manage system users, deactivate former employees, and change roles.
Route: /admin/users
User Role: Admin
Layout: Admin Shell.
Components:
Tables: Data table showing Name, Email, Role, Status, and Actions (Edit/Deactivate).
Search: Text input to search by name or email.
Filters: Dropdown filter by Role and Status.
Pagination: Standard bottom pagination (Previous, Page Numbers, Next).
Dialogs: Confirmation modal for "Deactivate User".
States:
Loading State: Table skeleton rows.
Empty State: Illustration "No users found" if search yields zero results.
Success Messages: Toast "User deactivated successfully."
Responsive Behavior: Table collapses into a card-based list view on mobile screens to prevent horizontal scrolling.
APIs Consumed: GET /api/users (assuming general user endpoint), PUT /api/users/:id.
3. Manager Pages (Dispatch & Verification)
3.1 Task Dispatch Board
Purpose: Command center for creating, assigning, and tracking tasks.
Route: /manager/tasks
User Role: Admin / Manager
Layout: Admin Shell.
Components:
Buttons: "Create New Task" (Primary, top right).
Tables: Task List (Title, Assignee, Priority, Status, Deadline, Actions).
Search: Search by Task Title or Assignee Name.
Filters: Status (Unassigned, In-progress, Completed), Priority, Date range.
Sorting: Sortable column headers (Deadline ascending/descending).
Dialogs: "Create Task" slide-out drawer or modal containing the creation form.
Forms: Task Creation Form (Title, Desc, Priority dropdown, Datepicker, Assignee dropdown populated via API, Location text).
States:
Loading State: Table skeleton.
Empty State: "No tasks scheduled yet. Create one to get started."
Success Messages: Toast "Task assigned to [Worker Name]."
Responsive Behavior: Table transforms to summary cards on mobile. Modals become full-screen on mobile.
APIs Consumed: GET /api/tasks, POST /api/tasks, GET /api/users/workers (for dropdown).
Navigation Flow: Click a row -> Redirect to Task Verification View.
3.2 Task Verification View
Purpose: Review submitted proof of work and officially close out the task.
Route: /manager/tasks/:id/verify
User Role: Admin / Manager
Layout: Admin Shell.
Components:
Cards:
Task Details Summary (left pane).
Submission Proof Card (right pane) containing uploaded image gallery, worker notes, and embedded map pin for GPS.
Buttons: "Approve Task" (Success Color), "Reject & Request Rework" (Danger Color).
Dialogs: Rejection modal requiring "Reason for rejection" text input.
States:
Loading State: Content skeleton.
Empty State: If not yet submitted, right pane shows "Waiting for worker to submit proof."
Responsive Behavior: Side-by-side panes stack vertically on mobile (Task Details top, Proof bottom).
APIs Consumed: GET /api/tasks/:id, PATCH /api/tasks/:id/verify.
Navigation Flow: On Approve -> Redirect back to Dispatch Board.
4. Worker Pages
4.1 Worker Itinerary (Dashboard)
Purpose: Provide a clear, mobile-first view of a worker's daily assignments.
Route: /worker/dashboard
User Role: Worker
Layout: Mobile-first App Shell (Bottom Tab Navigation, Top Header).
Components:
Cards: Task Item Cards (Title, Location, Deadline time, Priority Badge, Status Badge).
Filters: Quick toggle pills ("Today", "Upcoming", "Completed").
Empty State: Cheerful illustration "You're all caught up for today!"
States:
Loading State: Card skeletons.
Error State: "Offline Mode" banner appears at the top if network drops, utilizing Service Worker cache to display tasks.
Responsive Behavior: Optimized specifically for touch interfaces (large tap targets). Desktop view scales cards into a responsive grid.
APIs Consumed: GET /api/tasks/my-tasks.
Navigation Flow: Tap Task Card -> Redirect to Task Detail & Submission.
4.2 Task Detail & Submission
Purpose: View exact requirements, update progression, and upload proof of work.
Route: /worker/tasks/:id
User Role: Worker
Layout: Single-column scrollable mobile view with sticky bottom action bar.
Components:
Cards: Task description, address (with deep link to Google Maps).
Buttons:
"Start Task" (changes status to In-progress).
"Submit Proof" (Opens form).
Forms: Submission Form:
Image Uploader (Opens native camera or gallery).
Textarea for Notes.
Hidden input for captured HTML5 Geolocation.
Validation: Require at least one image upload before submission is allowed.
States:
Loading State: "Uploading images..." with a progress bar.
Success Messages: Screen-takeover checkmark animation on successful upload, then redirect.
Responsive Behavior: Camera integration must degrade gracefully to standard file input on unsupported browsers.
APIs Consumed: GET /api/tasks/:id, PATCH /api/tasks/:id/status, GET /api/upload/signature, POST /api/submissions.
Navigation Flow: On successful submission -> Redirect to /worker/dashboard with a success toast.
5. Shared Pages & Components
5.1 Notification Center (Dropdown/Drawer)
Purpose: Alert users to real-time events.
Route: Accessible globally via the Bell Icon in the Navbar.
User Role: All Roles
Layout: Popover dropdown (Desktop) or Slide-up Drawer (Mobile).
Components:
List: Unread notifications highlighted.
Buttons: "Mark all as read".
Empty State: "No new notifications."
APIs Consumed: GET /api/notifications, PATCH /api/notifications/:id/read.
Navigation Flow: Clicking a notification (e.g., "New Task Assigned") redirects to that specific task detail page.
5.2 User Profile Settings
Purpose: Allow users to manage their personal information.
Route: /settings
User Role: All Roles
Layout: Form layout within the respective role's App Shell.
Components:
Forms: Profile Picture upload, Update Phone Number, Change Password.
Buttons: "Save Changes".
Validation: Current password required to set a new password.
States:
Success Messages: "Profile updated successfully."
APIs Consumed: GET /api/auth/me, PUT /api/users/me (Assuming endpoint exists for profile updates).