#!/bin/bash

# CertiChain-BioVerify Backup Script
# Backs up MongoDB database

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="certchain_backup_$DATE.archive"

echo "🔄 Starting backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "📦 Backing up MongoDB..."
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump \
    --db certchain \
    --archive > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
cd $BACKUP_DIR
ls -t certchain_backup_*.gz | tail -n +8 | xargs -r rm
cd ..

echo "✅ Backup process completed successfully!"
