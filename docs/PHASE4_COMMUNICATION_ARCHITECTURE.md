# Phase 4: Communication Features Architecture

## Overview
This document outlines the architecture for the Communication module of the Integrated Management System, enabling messaging, announcements, and notifications between users.

## Database Schema

### 1. Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  subject VARCHAR(200),
  message_body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent', -- sent, read, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- idx_messages_sender: (sender_id)
- idx_messages_receiver: (receiver_id)
- idx_messages_school: (school_id)
- idx_messages_status: (status)

### 2. Announcements Table
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50), -- admin, principal, teacher, student, parent, or 'all'
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  publish_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- idx_announcements_school: (school_id)
- idx_announcements_target_role: (target_role)
- idx_announcements_status: (status)
- idx_announcements_publish_date: (publish_date)

### 3. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- message, announcement, payment_reminder, assignment_reminder, etc.
  reference_id UUID, -- ID of related entity (message_id, announcement_id, etc.)
  reference_type VARCHAR(50), -- message, announcement, payment, assignment, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- idx_notifications_user: (user_id)
- idx_notifications_type: (type)
- idx_notifications_is_read: (is_read)
- idx_notifications_created_at: (created_at)

## API Endpoints

### Messages API

#### GET /api/messages
- **Description:** Get all messages for the authenticated user
- **Auth:** Required
- **Query Params:**
  - `status` (optional): Filter by status (sent, read, deleted)
  - `sender_id` (optional): Filter by sender
- **Response:** Array of messages

#### GET /api/messages/conversations
- **Description:** Get conversation history with other users
- **Auth:** Required
- **Query Params:**
  - `user_id` (optional): Get conversation with specific user
- **Response:** Array of conversations

#### GET /api/messages/:id
- **Description:** Get a specific message
- **Auth:** Required
- **Response:** Message details

#### POST /api/messages
- **Description:** Send a new message
- **Auth:** Required
- **Body:**
  ```json
  {
    "receiver_id": "uuid",
    "subject": "string",
    "message_body": "string"
  }
  ```
- **Response:** Created message

#### PUT /api/messages/:id
- **Description:** Update message status (mark as read)
- **Auth:** Required
- **Body:**
  ```json
  {
    "status": "read"
  }
  ```
- **Response:** Updated message

#### DELETE /api/messages/:id
- **Description:** Delete a message
- **Auth:** Required
- **Response:** Success message

### Announcements API

#### GET /api/announcements
- **Description:** Get all announcements for the user's role
- **Auth:** Required
- **Query Params:**
  - `status` (optional): Filter by status (published, archived)
  - `priority` (optional): Filter by priority
- **Response:** Array of announcements

#### GET /api/announcements/:id
- **Description:** Get a specific announcement
- **Auth:** Required
- **Response:** Announcement details

#### POST /api/announcements
- **Description:** Create a new announcement
- **Auth:** Required (Admin/Principal only)
- **Body:**
  ```json
  {
    "title": "string",
    "content": "string",
    "target_role": "string",
    "priority": "string",
    "publish_date": "date",
    "expiry_date": "date"
  }
  ```
- **Response:** Created announcement

#### PUT /api/announcements/:id
- **Description:** Update an announcement
- **Auth:** Required (Admin/Principal only)
- **Body:**
  ```json
  {
    "title": "string",
    "content": "string",
    "target_role": "string",
    "priority": "string",
    "status": "string"
  }
  ```
- **Response:** Updated announcement

#### DELETE /api/announcements/:id
- **Description:** Delete an announcement
- **Auth:** Required (Admin/Principal only)
- **Response:** Success message

### Notifications API

#### GET /api/notifications
- **Description:** Get all notifications for the authenticated user
- **Auth:** Required
- **Query Params:**
  - `is_read` (optional): Filter by read status
  - `type` (optional): Filter by type
- **Response:** Array of notifications

#### GET /api/notifications/unread-count
- **Description:** Get count of unread notifications
- **Auth:** Required
- **Response:** Count object

#### PUT /api/notifications/:id
- **Description:** Mark notification as read
- **Auth:** Required
- **Body:**
  ```json
  {
    "is_read": true
  }
  ```
- **Response:** Updated notification

#### PUT /api/notifications/mark-all-read
- **Description:** Mark all notifications as read
- **Auth:** Required
- **Response:** Success message

#### DELETE /api/notifications/:id
- **Description:** Delete a notification
- **Auth:** Required
- **Response:** Success message

## Frontend Pages

### 1. Inbox Page (`/inbox`)
- **Features:**
  - Display list of received messages
  - Show sender name, subject, date, read status
  - Filter by status (all, unread)
  - Delete messages
  - Mark as read/unread

### 2. Message View Page (`/messages/:id`)
- **Features:**
  - Display full message content
  - Show conversation history
  - Reply to message
  - Forward message
  - Delete message

### 3. Compose Message Page (`/messages/compose`)
- **Features:**
  - Select recipient (autocomplete/dropdown)
  - Enter subject
  - Compose message body
  - Send message
  - Save draft (optional)

### 4. Announcements Page (`/announcements`)
- **Features:**
  - Display list of announcements
  - Filter by priority
  - Show title, content, date, priority badge
  - Admin/Principal: Create, edit, delete announcements

### 5. Notifications Center (`/notifications`)
- **Features:**
  - Display list of notifications
  - Filter by type
  - Mark as read/unread
  - Mark all as read
  - Delete notifications
  - Click to navigate to related entity

### 6. Dashboard Notification Widget
- **Features:**
  - Display unread message count
  - Display unread notification count
  - Quick links to inbox and notifications
  - Show latest 3 notifications

## Role-Based Permissions

### Admin
- **Messages:** Send/receive messages to/from all users
- **Announcements:** Full CRUD access
- **Notifications:** View all notifications

### Principal
- **Messages:** Send/receive messages to/from teachers, students, parents
- **Announcements:** Full CRUD access
- **Notifications:** View all notifications

### Teacher
- **Messages:** Send/receive messages to/from students, parents, other teachers
- **Announcements:** View only
- **Notifications:** View own notifications

### Student
- **Messages:** Send/receive messages to/from teachers only
- **Announcements:** View only
- **Notifications:** View own notifications

### Parent
- **Messages:** Send/receive messages to/from teachers only
- **Announcements:** View only
- **Notifications:** View own notifications

## Security Considerations

1. **Message Access Control:**
   - Users can only view messages they sent or received
   - Messages are scoped to the user's school
   - Role-based restrictions on who can message whom

2. **Announcement Access Control:**
   - Only Admin and Principal can create/edit/delete announcements
   - Users only see announcements targeted to their role
   - Draft announcements are only visible to creators

3. **Notification Privacy:**
   - Notifications are user-specific
   - Users cannot view other users' notifications
   - Reference IDs are validated before access

4. **Input Validation:**
   - All inputs are sanitized
   - SQL injection prevention via parameterized queries
   - XSS prevention via proper escaping

## Implementation Order

1. **Database Migrations:**
   - Create messages table
   - Create announcements table
   - Create notifications table
   - Run migrations

2. **Backend APIs:**
   - Create message controller
   - Create announcement controller
   - Create notification controller
   - Create routes
   - Register routes in main server

3. **API Testing:**
   - Test all message endpoints
   - Test all announcement endpoints
   - Test all notification endpoints
   - Test role-based permissions

4. **Frontend Pages:**
   - Create Inbox page
   - Create Message View page
   - Create Compose Message page
   - Create Announcements page
   - Create Notifications Center page
   - Add dashboard notification widget

5. **Role Testing:**
   - Test with Admin role
   - Test with Principal role
   - Test with Teacher role
   - Test with Student role
   - Test with Parent role

## Notification Types

1. **message:** New message received
2. **announcement:** New announcement published
3. **payment_reminder:** Payment due reminder
4. **payment_received:** Payment confirmation
5. **assignment_reminder:** Assignment due reminder
6. **assignment_graded:** Assignment graded
6. **attendance_alert:** Attendance alert
7. **general:** General system notification
