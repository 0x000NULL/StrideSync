# Production Deployment Guide

This guide provides step-by-step instructions for deploying StrideSync to a production environment.

## Prerequisites

- A server with:
  - Node.js 16+ and npm 7+
  - MongoDB 4.4+
  - Nginx or similar web server
  - SSL certificate (Let's Encrypt recommended)
- Domain name pointing to your server
- SMTP server for emails
- Cloud storage (S3, Google Cloud Storage, etc.) for file uploads

## Server Setup

### 1. Server Requirements

- **Minimum**:
  - 2 vCPUs
  - 4GB RAM
  - 50GB SSD storage
- **Recommended**:
  - 4+ vCPUs
  - 8GB+ RAM
  - 100GB+ SSD storage

### 2. Security Configuration

```bash
# Create a new user (not root)
adduser stridesync
usermod -aG sudo stridesync

# Set up firewall
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw enable

# Install fail2ban
apt install fail2ban
```

## Database Setup

### 1. Install MongoDB

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
```

### 2. Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "adminUser",
  pwd: "a-very-secure-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create application database and user
use stridesync_prod
db.createUser({
  user: "stridesync",
  pwd: "another-secure-password",
  roles: [ { role: "readWrite", db: "stridesync_prod" } ]
})

exit
```

## Application Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stride-sync.git /opt/stridesync
cd /opt/stridesync
```

### 2. Install Dependencies

```bash
npm install --production
npm run build
```

### 3. Environment Configuration

Create a `.env` file:

```env
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://stridesync:password@localhost:27017/stridesync_prod?authSource=stridesync_prod

# JWT
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM=StrideSync <noreply@stridesync.com>

# Storage
STORAGE_PROVIDER=aws-s3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_BUCKET=stridesync-uploads

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

### 4. Set Up PM2

```bash
npm install -g pm2

# Start the API
cd /opt/stridesync/apps/api
pm2 start npm --name "stridesync-api" -- start

# Start the web app
cd /opt/stridesync/apps/web
pm2 start npm --name "stridesync-web" -- start

# Save PM2 process list
pm2 save
pm2 startup

# Start PM2 on boot
systemctl enable pm2-root
```

## Web Server Configuration (Nginx)

### 1. Install Nginx

```bash
apt install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/stridesync`:

```nginx
# API server
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web app
server {
    listen 80;
    server_name app.yourdomain.com;
    
    root /opt/stridesync/apps/web/.next;
    index index.html;
    
    location / {
        try_files $uri $uri/ /_next/static $uri/ =404;
    }
    
    location /_next/static {
        alias /opt/stridesync/apps/web/.next/static;
        expires 365d;
        access_log off;
    }
}
```

### 3. Enable the Site

```bash
ln -s /etc/nginx/sites-available/stridesync /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Set up automatic renewal
echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

## Backups

### 1. Database Backup Script

Create `/opt/stridesync/scripts/backup-db.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/backup-$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup-$DATE.tar.gz -C $BACKUP_DIR backup-$DATE
rm -rf $BACKUP_DIR/backup-$DATE

# Remove old backups
find $BACKUP_DIR -name "backup-*.tar.gz" -type f -mtime +$KEEP_DAYS -delete
```

Make it executable:
```bash
chmod +x /opt/stridesync/scripts/backup-db.sh
```

### 2. Set Up Cron Job

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * /opt/stridesync/scripts/backup-db.sh
```

## Monitoring

### 1. Install PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Set Up Monitoring Dashboard (Optional)

```bash
pm2 install pm2-server-monit
pm2 install pm2-logrotate
```

## Updating the Application

1. Pull the latest changes:
   ```bash
   cd /opt/stridesync
   git pull
   ```

2. Install new dependencies:
   ```bash
   npm install
   npm run build
   ```

3. Restart the application:
   ```bash
   pm2 restart all
   ```

## Troubleshooting

### Check Logs

```bash
# Application logs
pm2 logs

# Nginx error log
tail -f /var/log/nginx/error.log

# MongoDB log
tail -f /var/log/mongodb/mongod.log
```

### Common Issues

- **Port in use**: Use `lsof -i :<port>` to find and kill the process
- **Permission denied**: Ensure the `stridesync` user has proper permissions
- **MongoDB connection issues**: Verify the connection string and that MongoDB is running

## Next Steps

- Set up monitoring (e.g., New Relic, Datadog)
- Configure alerts for critical issues
- Set up a CI/CD pipeline for automated deployments
- Configure a CDN for static assets

## Support

For additional help, please contact support@stridesync.com or open an issue on our [GitHub repository](https://github.com/stride-sync/stride-sync).
