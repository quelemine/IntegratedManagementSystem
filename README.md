# SIM Technology Institute Management System

A comprehensive integrated management, learning, and communication platform for SIM Technology Institute - an ABC-Grade 12 Liberian school.

## Project Overview

This system provides a complete solution for school administration, student management, academic tracking, financial management, and communication. It serves administrators, teachers, students, and parents with role-based access to relevant features.

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (migrated from SQLite)
- **Knex.js** - Query builder and migrations
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **Swagger** - API documentation

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **PostgreSQL on Render** - Database hosting

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/quelemine/IntegratedManagementSystem.git
   cd IntegratedManagementSystem
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/simtech_db
   DB_CLIENT=pg
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=simtech_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Terminal 1 - Backend
   npm start

   # Terminal 2 - Frontend
   npm run client
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Default Admin Account
After seeding, you can login with:
- Email: `admin@simtechinstitute.edu`
- Password: `ChangeMe123!`

**Important:** Change the default password immediately after first login.

## Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

### Optional Variables
- `DB_CLIENT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Alternative database configuration
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration for notifications

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build and start commands:
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
4. Add environment variables from the `.env` file
5. Deploy

### Frontend (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure root directory as `client`
4. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL
5. Deploy

### Database (Render)

1. Create a new PostgreSQL database on Render
2. Copy the internal database URL
3. Add `DATABASE_URL` to backend environment variables
4. Run migrations on the deployed database:
   ```bash
   npx knex migrate:latest --env production
   npx knex seed:run --env production
   ```

## Database Setup

### PostgreSQL Schema

The application uses PostgreSQL with the following main tables:
- `schools` - School information
- `roles` - User roles (super_admin, principal, teacher, student, parent, staff)
- `users` - User accounts
- `students` - Student records
- `teachers` - Teacher records
- `parents` - Parent records
- `classes` - Class information
- `grades` - Grade levels
- `divisions` - School divisions
- `courses` - Course offerings
- `subjects` - Subject information
- `attendance` - Attendance records
- `assignments` - Assignment tracking
- `quizzes` - Quiz management
- `student_grades` - Grade records
- `fee_categories` - Fee categories
- `tuition_structures` - Tuition fees
- `class_fees` - Class-specific fees
- `discounts` - Discount rules
- `scholarships` - Scholarship programs
- `payments` - Payment records
- `messages` - Internal messaging
- `notifications` - User notifications
- `announcements` - School announcements

### Migrations

Database migrations are managed with Knex.js:
```bash
# Run latest migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# View migration status
npx knex migrate:status
```

### Seeds

Seed data creates initial roles, school, and admin user:
```bash
npm run seed
```

## Features

### Administration
- User management with role-based access
- School configuration and branding
- Role and permission management
- Audit logging

### Academic Management
- Class and grade management
- Course and subject management
- Student enrollment
- Teacher assignment
- Attendance tracking
- Assignment and quiz management
- Grade recording and reporting

### Financial Management
- Fee category management
- Tuition structure setup
- Class fee configuration
- Discount and scholarship management
- Payment tracking
- Financial reporting

### Communication
- Internal messaging system
- School announcements
- Notifications
- Help desk support

### Reporting
- Student grade reports
- Attendance reports
- Financial reports
- Export to PDF

## Security

- JWT-based authentication
- Role-based authorization
- School scope data isolation
- Rate limiting
- Security headers (Helmet)
- Input validation
- Password hashing with bcrypt
- CORS configuration

## API Documentation

Interactive API documentation is available via Swagger UI:
- Development: http://localhost:5000/api-docs
- Production: https://your-backend-url/api-docs

## Support

For issues, questions, or contributions, please visit the GitHub repository.

## License

MIT License - see LICENSE file for details

## Version History

### v1.0.0 (Current)
- Initial production release
- PostgreSQL migration from SQLite
- Complete CRUD operations for all entities
- Role-based access control
- Financial management system
- Communication features
- Security enhancements
