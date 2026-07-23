# Database Backup Strategy

## Overview
This document outlines the backup and restore procedures for the Integrated Management System PostgreSQL database.

## Backup Schedule

### Automated Backups
- **Daily Backups**: Full database backup at 2:00 AM UTC
- **Weekly Backups**: Full backup with retention of 4 weeks
- **Monthly Backups**: Full backup with retention of 12 months

### Manual Backups
Perform manual backups before:
- Major system updates
- Schema migrations
- Data imports/exports
- Production deployments

## Backup Procedures

### Using pg_dump (Command Line)

#### Full Database Backup
```bash
pg_dump -U [username] -h [hostname] -p [port] [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql
```

Example:
```bash
pg_dump -U postgres -h localhost -p 5432 integrated_management_system > backup_20240120_020000.sql
```

#### Compressed Backup
```bash
pg_dump - U [username] -h [hostname] -p [port] [database_name] | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Schema-Only Backup
```bash
pg_dump -U [username] -h [hostname] -p [port] --schema-only [database_name] > schema_backup.sql
```

#### Data-Only Backup
```bash
pg_dump -U [username] -h [hostname] -p [port] --data-only [database_name] > data_backup.sql
```

### Using pgAdmin
1. Right-click on database
2. Select "Backup"
3. Choose format (Plain, Custom, Directory)
4. Select backup location
5. Click "Backup"

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash

# Configuration
DB_NAME="integrated_management_system"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# Perform backup
pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    
    # Remove backups older than retention period
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "Old backups removed (older than $RETENTION_DAYS days)"
else
    echo "Backup failed!"
    exit 1
fi
```

Add to crontab for daily execution:
```bash
0 2 * * * /path/to/backup.sh >> /var/log/postgresql_backup.log 2>&1
```

## Restore Procedures

### Using psql (Command Line)

#### Restore from SQL File
```bash
psql -U [username] -h [hostname] -p [port] [database_name] < backup_file.sql
```

#### Restore from Compressed File
```bash
gunzip -c backup_file.sql.gz | psql -U [username] -h [hostname] -p [port] [database_name]
```

#### Restore to New Database
```bash
# Create new database
createdb -U [username] new_database_name

# Restore to new database
psql -U [username] -h [hostname] -p [port] new_database_name < backup_file.sql
```

### Using pgAdmin
1. Right-click on database
2. Select "Restore"
3. Select backup file
4. Choose restore options
5. Click "Restore"

## Backup Storage

### Local Storage
- Store backups on separate disk from database
- Use RAID for redundancy
- Monitor disk space usage

### Offsite Storage
- Copy backups to remote location
- Use cloud storage (AWS S3, Google Cloud Storage, etc.)
- Implement encryption for offsite backups

### Backup Retention Policy
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 12 weeks
- **Monthly backups**: Keep for 12 months
- **Pre-migration backups**: Keep indefinitely

## Disaster Recovery

### Recovery Time Objective (RTO)
- Target: 4 hours for full system recovery
- Database restore: 1-2 hours
- Application deployment: 1-2 hours

### Recovery Point Objective (RPO)
- Maximum acceptable data loss: 24 hours
- Achievable with daily backups

### Disaster Recovery Steps
1. Assess damage and determine recovery scope
2. Identify last known good backup
3. Prepare restore environment
4. Restore database from backup
5. Verify data integrity
6. Restore application from version control
7. Configure environment variables
8. Test system functionality
9. Switch DNS to restored system
10. Monitor for issues

## Monitoring

### Backup Monitoring
- Monitor backup job success/failure
- Alert on backup failures
- Track backup file sizes
- Monitor disk space

### Monitoring Script
```bash
#!/bin/bash

# Check if recent backup exists
BACKUP_DIR="/var/backups/postgresql"
HOURS_SINCE_BACKUP=26

if find $BACKUP_DIR -name "backup_*.sql.gz" -mtime -1 | grep -q .; then
    echo "✓ Recent backup found"
else
    echo "✗ No recent backup found!"
    # Send alert (email, Slack, etc.)
fi
```

## Security Considerations

### Backup Encryption
- Encrypt backups at rest
- Use AES-256 encryption
- Store encryption keys securely

### Access Control
- Restrict backup file access to authorized users
- Use file permissions (chmod 600)
- Audit backup access logs

### Secure Backup Transfer
- Use SFTP/SCP for remote transfers
- Verify checksums after transfer
- Use encrypted connections

## Testing

### Regular Backup Testing
- Test restore procedure monthly
- Verify data integrity after restore
- Document any issues encountered

### Test Restore Procedure
1. Create test database
2. Restore backup to test database
3. Run data validation queries
4. Test application connectivity
5. Document results

## Troubleshooting

### Common Issues

#### Backup Fails Due to Locks
```bash
# Terminate connections before backup
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'your_database';
```

#### Restore Fails Due to Version Mismatch
- Ensure PostgreSQL versions match
- Use pg_dump with appropriate version
- Consider using custom format for portability

#### Disk Space Issues
- Monitor disk usage regularly
- Implement cleanup of old backups
- Compress backups to save space

## Contact Information
- Database Administrator: [contact]
- System Administrator: [contact]
- On-Call Rotation: [contact]
