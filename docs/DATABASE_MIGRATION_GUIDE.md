# Database Migration Guide

## Overview
This guide covers database migration procedures for the Integrated Management System using Knex.js.

## Prerequisites
- PostgreSQL database installed and running
- Node.js and npm installed
- Database credentials configured in `.env` file

## Environment Variables
Ensure the following are set in your `.env` file:
```
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=integrated_management_system
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Running Migrations

### Create a New Migration
```bash
cd server
npx knex migrate:make migration_name
```

### Run All Pending Migrations
```bash
cd server
npx knex migrate:latest
```

### Rollback Last Migration
```bash
cd server
npx knex migrate:rollback
```

### Rollback All Migrations
```bash
cd server
npx knex migrate:rollback --all
```

### List Migration Status
```bash
cd server
npx knex migrate:status
```

## Migration Files
Migration files are located in `server/migrations/` and follow the naming convention:
`YYYYMMDDHHMMSS_migration_name.js`

### Migration Structure
```javascript
exports.up = function(knex) {
  // Changes to apply
  return knex.schema
    .createTable('table_name', function(table) {
      table.uuid('id').primary();
      // ... other columns
    });
};

exports.down = function(knex) {
  // Changes to rollback
  return knex.schema.dropTable('table_name');
};
```

## Current Migrations
1. `20240116000001_create_roles.js` - Roles table
2. `20240116000002_create_schools.js` - Schools table
3. `20240116000003_create_divisions.js` - Divisions table
4. `20240116000004_create_grades.js` - Grades table
5. `20240116000005_create_classes.js` - Classes table
6. `20240116000006_create_users.js` - Users table
7. `20240116000007_create_students.js` - Students table
8. `20240116000008_create_teachers.js` - Teachers table
9. `20240116000009_create_parents.js` - Parents table
10. `20240116000010_create_attendance.js` - Attendance table
11. `20240116000011_create_assignments.js` - Assignments table
12. `20240116000012_create_assignment_submissions.js` - Assignment submissions table
13. `20240116000013_create_quizzes.js` - Quizzes table
14. `20240116000014_create_quiz_attempts.js` - Quiz attempts table
15. `20240116000015_create_student_grades.js` - Student grades table
16. `20240116000016_create_fees.js` - Fees table
17. `20240116000017_create_invoices.js` - Invoices table
18. `20240116000018_create_payments.js` - Payments table
19. `20240116000019_create_audit_logs.js` - Audit logs table
20. `20240116000020_create_events.js` - Events table
21. `20240116000034_create_announcements.js` - Announcements table
22. `20240116000035_create_messages.js` - Messages table
23. `20240116000036_create_notifications.js` - Notifications table
24. `20240116000040_add_indexes.js` - Performance indexes

## Seeding Data

### Run All Seeds
```bash
cd server
npx knex seed:run
```

### Create a New Seed
```bash
cd server
npx knex seed:make seed_name
```

## Best Practices

1. **Always test migrations locally** before applying to production
2. **Backup database** before running migrations in production
3. **Write reversible migrations** - always implement both `up` and `down` functions
4. **Use transactions** for complex migrations
5. **Document breaking changes** in migration file comments
6. **Never modify existing migrations** - create new ones instead

## Troubleshooting

### Migration Lock Issues
If migrations get stuck due to lock issues:
```sql
DELETE FROM knex_migrations_lock;
```

### Check Current Migration Status
```sql
SELECT * FROM knex_migrations ORDER BY id;
```

### Rollback Specific Migration
If you need to rollback to a specific point, use:
```bash
npx knex migrate:rollback --all
npx knex migrate:latest
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] Backup current database
- [ ] Test migrations on staging environment
- [ ] Review migration files for potential data loss
- [ ] Schedule maintenance window
- [ ] Notify users of potential downtime

### Deployment Steps
1. Backup database: `pg_dump -U user -d database > backup.sql`
2. Run migrations: `npx knex migrate:latest`
3. Verify migration status: `npx knex migrate:status`
4. Run seeds if needed: `npx knex seed:run`
5. Test application functionality
6. Monitor for errors

### Rollback Procedure
If deployment fails:
1. Stop application
2. Rollback migrations: `npx knex migrate:rollback`
3. Restore database from backup: `psql -U user -d database < backup.sql`
4. Restart application
5. Investigate failure cause
