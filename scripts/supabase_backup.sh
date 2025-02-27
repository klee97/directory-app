#!/bin/bash

# Supabase Backup Script
# This script creates a backup of a Supabase database and stores it in a specified location
# Usage: ./supabase_backup.sh

# Configuration
SUPABASE_PROJECT_ID="projectId"  # Replace with your Supabase project ID
BACKUP_DIR="directory/path"  # Replace with your backup directory path
ADMIN_PASSWORD="password" # Replace with your Supabase admin password
RETENTION_DAYS=7                       # Number of days to keep backups

# Wait for Docker to be running
until docker info > /dev/null 2>&1; do
  echo "Waiting for Docker to start..."
  sleep 1
done
echo "Docker is running!"

# Create timestamp for the backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/supabase_backup_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Log start of backup
echo "Starting Supabase backup at $(date)"

# Run the Supabase database dump
echo "Running supabase db dump..."
supabase db dump -p "$SUPABASE_PROJECT_ID" -f "$BACKUP_FILE" -p "$ADMIN_PASSWORD"

# Check if backup was successful
if [ $? -eq 0 ]; then
  # Compress the backup file
  echo "Compressing backup file..."
  gzip "$BACKUP_FILE"
  
  # Log success message with file size
  COMPRESSED_FILE="${BACKUP_FILE}.gz"
  FILESIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
  echo "Backup completed successfully at $(date). Backup size: $FILESIZE"
  echo "Backup stored at: $COMPRESSED_FILE"
  
  # Clean up old backups
  echo "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "supabase_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  
  # Count remaining backups
  BACKUP_COUNT=$(find "$BACKUP_DIR" -name "supabase_backup_*.sql.gz" | wc -l)
  echo "Current number of backups: $BACKUP_COUNT"
else
  echo "Error: Backup failed at $(date)"
  exit 1
fi

echo "Backup process completed"