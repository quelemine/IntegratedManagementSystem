# SIM Technology Institute API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "user": { ... },
      "token": "string",
      "refreshToken": "string"
    }
  }
  ```

### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "role_id": "uuid",
    "school_id": "uuid"
  }
  ```

### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer {token}`

### Refresh Token
- **POST** `/api/auth/refresh`
- **Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```

### Get Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer {token}`

### Update Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "profile_image": "string"
  }
  ```

### Change Password
- **POST** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "current_password": "string",
    "new_password": "string"
  }
  ```

### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "string"
  }
  ```

### Reset Password
- **POST** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "string",
    "password": "string"
  }
  ```

## Users

### Get All Users
- **GET** `/api/users?page=1&limit=20&role=string&search=string`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `role`: Filter by role
  - `search`: Search by name or email

### Get User by ID
- **GET** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create User
- **POST** `/api/users`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "role_id": "uuid",
    "school_id": "uuid"
  }
  ```
- **Authorization:** Super Admin only

### Update User
- **PUT** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "profile_image": "string",
    "role_id": "uuid",
    "is_active": "boolean"
  }
  ```

### Delete User
- **DELETE** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

### Get Users by Role
- **GET** `/api/users/role/{role}`
- **Headers:** `Authorization: Bearer {token}`

## Schools

### Get All Schools
- **GET** `/api/schools?page=1&limit=20&search=string`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

### Get Current User's School
- **GET** `/api/schools/my-school`
- **Headers:** `Authorization: Bearer {token}`

### Get School by ID
- **GET** `/api/schools/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create School
- **POST** `/api/schools`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only
- **Body:**
  ```json
  {
    "name": "string",
    "code": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "logo_url": "string",
    "primary_color": "string",
    "secondary_color": "string",
    "accent_color": "string",
    "settings": {}
  }
  ```

### Update School
- **PUT** `/api/schools/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

### Update School Branding
- **PUT** `/api/schools/{id}/branding`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only
- **Body:**
  ```json
  {
    "primary_color": "string",
    "secondary_color": "string",
    "accent_color": "string",
    "logo_url": "string"
  }
  ```

### Delete School
- **DELETE** `/api/schools/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

## Divisions

### Get All Divisions
- **GET** `/api/divisions`
- **Headers:** `Authorization: Bearer {token}`

### Get Division by ID
- **GET** `/api/divisions/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create Division
- **POST** `/api/divisions`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Update Division
- **PUT** `/api/divisions/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Delete Division
- **DELETE** `/api/divisions/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

## Grades

### Get All Grades
- **GET** `/api/grades?division_id=uuid`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:**
  - `division_id`: Filter by division

### Get Grade by ID
- **GET** `/api/grades/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create Grade
- **POST** `/api/grades`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Update Grade
- **PUT** `/api/grades/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Delete Grade
- **DELETE** `/api/grades/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

## Classes

### Get All Classes
- **GET** `/api/classes?grade_id=uuid&division_id=uuid`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:**
  - `grade_id`: Filter by grade
  - `division_id`: Filter by division

### Get Class by ID
- **GET** `/api/classes/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create Class
- **POST** `/api/classes`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Update Class
- **PUT** `/api/classes/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal only

### Delete Class
- **DELETE** `/api/classes/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only

## Students

### Get All Students
- **GET** `/api/students?page=1&limit=20&class_id=uuid&grade_id=uuid&division_id=uuid&search=string`
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `class_id`: Filter by class
  - `grade_id`: Filter by grade
  - `division_id`: Filter by division
  - `search`: Search by student ID or name

### Get Student by ID
- **GET** `/api/students/{id}`
- **Headers:** `Authorization: Bearer {token}`

### Create Student
- **POST** `/api/students`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal, Teacher only
- **Body:**
  ```json
  {
    "user_id": "uuid",
    "student_id": "string",
    "class_id": "uuid",
    "grade_id": "uuid",
    "division_id": "uuid",
    "date_of_birth": "string",
    "gender": "string",
    "address": "string",
    "enrollment_date": "string",
    "photo_url": "string",
    "emergency_contact_name": "string",
    "emergency_contact_phone": "string",
    "medical_info": "string"
  }
  ```

### Update Student
- **PUT** `/api/students/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal, Teacher only

### Delete Student
- **DELETE** `/api/students/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin only
- **Note:** Soft delete (sets status to inactive)

### Get Student Profile (for students)
- **GET** `/api/students/my-profile`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Students only

### Generate ID Card
- **POST** `/api/students/{id}/generate-id-card`
- **Headers:** `Authorization: Bearer {token}`
- **Authorization:** Super Admin, Principal, Teacher only

### Download ID Card
- **GET** `/api/students/{id}/download-id-card`
- **Headers:** `Authorization: Bearer {token}`

## Health Check

### Health Check
- **GET** `/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "message": "SIM Technology Institute API is running",
    "timestamp": "string"
  }
  ```

## API Documentation (Swagger)
- **GET** `/api-docs`
- Interactive API documentation using Swagger UI

## Default Credentials

### Super Admin
- **Email:** admin@simtechinstitute.edu
- **Password:** ChangeMe123!

## Roles

The system supports the following roles:
- `super_admin`: Full system access
- `principal`: School-level administration
- `teacher`: Teaching staff
- `staff`: Non-teaching staff
- `student`: Student access
- `parent`: Parent access
- `accountant`: Financial management

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error or invalid input"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Pagination

Most list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## School Scoping

Most endpoints are school-scoped, meaning users can only access data from their own school. Super Admins can access all schools.
