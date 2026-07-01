Database Design Document
Smart Field Operations & Workforce Management System
1. Collection Specifications
1.1 Users Collection
Purpose: Manages system access, authentication, role-based access control, and worker status.
Fields & Data Types:
_id: ObjectId
name: String
email: String
password: String (Hashed)
role: String
status: String
phone: String
profilePicture: String (URL)
Required Fields: name, email, password, role.
Optional Fields: phone, profilePicture.
Validation Rules:
email: Must be a valid email format and globally unique.
role: Enum ['admin', 'worker', 'dispatcher'].
status: Enum ['active', 'on-leave', 'inactive'] (Supports soft deletes).
Relationships:
One-to-Many with Tasks (as assignee).
One-to-Many with Submissions (as author).
One-to-Many with Notifications (as recipient).
Indexes:
{ email: 1 } (Unique, required for fast login).
{ role: 1, status: 1 } (Compound index for fetching available workers).
Timestamps: createdAt, updatedAt (Automatically managed).
Future Scalability: If worker profiles grow to include certifications, emergency contacts, or vehicle details, a separate WorkerProfiles collection can be created, linking back to Users via a 1:1 relationship to prevent document bloat.
1.2 Tasks Collection
Purpose: Core entity representing a work order, its location, deadline, and current lifecycle state.
Fields & Data Types:
_id: ObjectId
title: String
description: String
priority: String
deadline: Date
locationAddress: String
locationCoordinates: GeoJSON Point (Longitude, Latitude)
assignedTo: ObjectId (Reference to Users)
createdBy: ObjectId (Reference to Users)
status: String
Required Fields: title, priority, deadline, status, createdBy.
Optional Fields: description, locationAddress, locationCoordinates, assignedTo (can be unassigned initially).
Validation Rules:
priority: Enum ['low', 'medium', 'high', 'urgent'].
status: Enum ['unassigned', 'assigned', 'in-progress', 'completed', 'verified', 'overdue', 'rejected'].
Relationships:
Many-to-One with Users (Assignee).
Many-to-One with Users (Creator).
One-to-One with Submissions (A task usually has one final approved submission).
Indexes:
{ assignedTo: 1, status: 1 } (Compound index for worker's mobile dashboard).
{ status: 1, deadline: 1 } (Compound index for admin dashboard to find overdue/pending tasks).
{ locationCoordinates: "2dsphere" } (Enables geospatial queries for future geofencing features).
Timestamps: createdAt, updatedAt.
Future Scalability: If tasks require sub-tasks or checklists, those should be embedded as an array of objects within the document (up to MongoDB's 16MB limit) to avoid costly joins.
1.3 Submissions Collection
Purpose: Acts as the digital proof of work, securely tying a worker's physical location and media to a specific task.
Fields & Data Types:
_id: ObjectId
taskId: ObjectId (Reference to Tasks)
workerId: ObjectId (Reference to Users)
images: Array of Strings (Cloudinary URLs)
notes: String
submittedLocation: GeoJSON Point
isVerified: Boolean
verifiedBy: ObjectId (Reference to Users)
verificationFeedback: String
Required Fields: taskId, workerId, isVerified.
Optional Fields: images, notes, submittedLocation, verifiedBy, verificationFeedback.
Validation Rules:
images: Array length validated to prevent excessive uploads (e.g., max 5 images).
isVerified: Defaults to false.
Relationships:
Many-to-One with Tasks.
Many-to-One with Users (Worker).
Many-to-One with Users (Admin/Verifier).
Indexes:
{ taskId: 1 } (Unique or standard index depending on if multiple submissions per task are allowed before approval).
{ workerId: 1, createdAt: -1 } (Compound index for auditing worker history).
Timestamps: createdAt (Acts as the submittedAt timestamp), updatedAt.
Future Scalability: Heavy media logic. Storing only URLs ensures the database remains fast. If a single task requires dozens of submissions over weeks (like a construction project), this collection structure scales infinitely without bloating the Task document.
1.4 Notifications Collection
Purpose: Handles system alerts for users to drive the real-time engagement of the application.
Fields & Data Types:
_id: ObjectId
userId: ObjectId (Reference to Users)
message: String
type: String
relatedTaskId: ObjectId (Reference to Tasks)
isRead: Boolean
Required Fields: userId, message, type, isRead.
Optional Fields: relatedTaskId (Not all notifications relate to a task).
Validation Rules:
type: Enum ['task_assigned', 'task_updated', 'system_alert', 'deadline_warning'].
isRead: Defaults to false.
Relationships:
Many-to-One with Users (Recipient).
Many-to-One with Tasks (Context).
Indexes:
{ userId: 1, isRead: 1 } (Highly optimized for fetching unread notifications in the UI header).
{ createdAt: 1 } (TTL index - automatically delete notifications older than 30 days to save space).
Timestamps: createdAt, updatedAt.
Future Scalability: Using a TTL (Time-To-Live) index on this collection ensures it doesn't grow indefinitely, protecting the free-tier MongoDB storage limits.
2. Relationship Diagram
Mermaid diagram
3. Normalization Decisions
MongoDB is a NoSQL database, meaning strict normalization (3NF) is often traded for read performance via denormalization.

Referencing vs. Embedding:
Tasks and Users: We use Referencing (storing assignedTo as an ObjectId). If a user changes their name or profile picture, it automatically reflects globally without needing to update thousands of historical tasks.
Submissions and Tasks: We use Referencing. While embedding a submission inside the Task document seems logical, proof-of-work arrays can grow unpredictably (large notes, multiple GPS pings, rejected attempts). Keeping them separate prevents the Tasks collection from exceeding MongoDB document size limits and keeps Task list queries lightweight.
Denormalization Exception (Analytics): For the analytics dashboard, we will not store aggregated data directly in these collections. Instead, we will rely on MongoDB Aggregation Pipelines to calculate completion rates dynamically, ensuring data is always 100% accurate.
4. Query Optimization Recommendations
Covered Queries: Design indexes so the most common queries are "covered" (all requested fields are present in the index). For example, the worker dashboard frequently queries assignedTo and status. The compound index { assignedTo: 1, status: 1 } ensures MongoDB doesn't have to scan the disk for these lookups.
TTL Indexes for Housekeeping: Implement a TTL index on Notifications (e.g., expireAfterSeconds: 2592000 for 30 days) to automatically purge old data and reduce collection scanning times.
Geospatial Optimization: The use of 2dsphere indexes on location fields allows for highly optimized $near and $geoWithin queries, essential for the geofencing validation recommended in the architecture refinement phase.
Pagination: Never use .skip() for pagination on large datasets (it forces MongoDB to scan all skipped documents). Implement Cursor-based pagination (using _id > last_seen_id) for the Tasks list to ensure O(1) query performance regardless of how many pages the admin scrolls through.