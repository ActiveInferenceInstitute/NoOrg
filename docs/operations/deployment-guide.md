# Deployment Guide

Comprehensive guide for deploying the NoOrg Multi-Agent Framework in production environments.

## Overview

This guide covers deployment strategies, configuration, monitoring, and operational procedures for running the NoOrg framework in production.

## Quick Start Deployment

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/ActiveInferenceInstitute/NoOrg.git
cd NoOrg

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f coordinator
```

### Using Docker (Single Container)

```bash
# Build and run
docker build -t noorg/multiagent-framework .
docker run -d \
  --name noorg-coordinator \
  -p 3000:3000 \
  -p 9090:9090 \
  -e OPENAI_API_KEY=your-key \
  -e NODE_ENV=production \
  noorg/multiagent-framework
```

### Manual Installation

```bash
# Install dependencies
npm install

# Build application
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start application
npm start
```

## Environment Configuration

### Production Environment Variables

```bash
# Core Configuration
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-production-key
DEFAULT_MODEL=gpt-4o
MAX_TOKENS=8000
TEMPERATURE=0.7

# Coordinator Configuration
COORDINATOR_NAME=Production Coordinator
MAX_CONCURRENT_TASKS=20
ENABLE_AUTO_RETRY=true
TASK_PRIORITY_QUEUE=true

# Monitoring & Metrics
ENABLE_METRICS=true
METRICS_PORT=9090
DASHBOARD_PORT=3000
ENABLE_HEALTH_CHECKS=true

# Security
ENABLE_AUTHENTICATION=true
JWT_SECRET=your-secure-jwt-secret
API_KEY=your-secure-api-key
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Database (if using external database)
DATABASE_URL=postgresql://user:pass@host:5432/noorg
REDIS_URL=redis://host:6379

# External Integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
EMAIL_SMTP_HOST=smtp.yourcompany.com
EMAIL_SMTP_USER=your-email@company.com
EMAIL_SMTP_PASSWORD=your-app-password

# Performance
WORKER_THREADS=8
MAX_MEMORY_MB=4096
ENABLE_CACHING=true

# Backup
ENABLE_AUTO_BACKUP=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30
```

### Staging Environment

```bash
NODE_ENV=staging
DEBUG=true
LOG_LEVEL=debug
OPENAI_API_KEY=sk-proj-your-staging-key
MAX_CONCURRENT_TASKS=5
```

### Development Environment

```bash
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
OPENAI_API_KEY=sk-proj-your-dev-key
HOT_RELOAD_ENABLED=true
ENABLE_DEBUG_ENDPOINTS=true
```

## Deployment Strategies

### Single Instance Deployment

For small-scale deployments:

```bash
# Using Docker
docker run -d \
  --name noorg-single \
  -p 3000:3000 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  noorg/multiagent-framework

# Using PM2
npm install -g pm2
pm2 start dist/index.js --name "noorg-coordinator"
pm2 save
pm2 startup
```

### Multi-Instance Deployment

For high-availability deployments:

```yaml
# docker-compose.yml
version: '3.8'
services:
  coordinator-1:
    image: noorg/multiagent-framework
    environment:
      - COORDINATOR_ID=coordinator-1
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  coordinator-2:
    image: noorg/multiagent-framework
    environment:
      - COORDINATOR_ID=coordinator-2
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: noorg-coordinator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: noorg-coordinator
  template:
    metadata:
      labels:
        app: noorg-coordinator
    spec:
      containers:
      - name: coordinator
        image: noorg/multiagent-framework:latest
        ports:
        - containerPort: 3000
        - containerPort: 9090
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Monitoring and Observability

### Health Checks

The application includes built-in health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Check metrics
curl http://localhost:9090/metrics

# Check agent health
curl http://localhost:3000/api/health/agents
```

### Logging

Configure centralized logging:

```yaml
# docker-compose logging
services:
  coordinator:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

# For production, use external logging
logging:
  driver: "syslog"
  options:
    syslog-address: "tcp://log-collector:514"
```

### Metrics and Monitoring

Set up monitoring stack:

```yaml
# docker-compose monitoring
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9091:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your-grafana-password
    volumes:
      - grafana-data:/var/lib/grafana
```

## Security Configuration

### Authentication Setup

```bash
# Generate JWT secret
openssl rand -base64 32

# Configure API keys
openssl rand -hex 32
```

### TLS/SSL Configuration

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure HTTPS
# Set SSL_CERT_PATH and SSL_KEY_PATH in .env
# Set ENABLE_HTTPS=true
```

### Security Best Practices

1. **Use strong secrets**: Generate cryptographically secure secrets
2. **Enable rate limiting**: Configure appropriate rate limits
3. **Enable audit logging**: Track all system activities
4. **Regular security updates**: Keep dependencies updated
5. **Network security**: Use firewalls and VPNs
6. **Access control**: Implement role-based access
7. **Data encryption**: Encrypt sensitive data at rest and in transit

## Backup and Recovery

### Automated Backups

```bash
# Enable automatic backups in .env
ENABLE_AUTO_BACKUP=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_PATH=./backups
```

### Manual Backup

```bash
# Create manual backup
npm run backup

# List available backups
npm run backup:list

# Restore from backup
cp backups/state-backup.json data/coordinator-state.json
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump -h localhost -U noorg noorg > backup.sql

# Redis backup
redis-cli SAVE
cp /data/dump.rdb backup.rdb
```

## Scaling and Performance

### Horizontal Scaling

```yaml
# Scale coordinators
docker-compose up -d --scale coordinator=3

# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: noorg-coordinator-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: noorg-coordinator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Performance Tuning

```bash
# Monitor performance
npm run performance

# Optimize memory usage
NODE_OPTIONS="--max-old-space-size=8192"

# Enable clustering
npm run start:cluster
```

## Troubleshooting

### Common Issues

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Analyze memory usage
npm run analyze:deps

# Optimize memory
# Adjust MAX_MEMORY_MB in .env
# Enable memory monitoring
```

#### High CPU Usage

```bash
# Check CPU usage
top -p $(pgrep -f "node.*noorg")

# Profile CPU usage
npm run performance:profile

# Optimize CPU usage
# Reduce MAX_CONCURRENT_TASKS
# Enable task prioritization
```

#### Network Issues

```bash
# Check network connectivity
curl -v http://localhost:3000/health

# Check external API connectivity
curl -v https://api.openai.com/v1/models

# Debug network issues
# Check firewall settings
# Verify API keys
# Check rate limits
```

#### Database Connection Issues

```bash
# Check database connectivity
docker-compose exec postgres psql -U noorg -d noorg -c "SELECT 1;"

# Check connection pool
curl http://localhost:3000/api/health/database

# Debug database issues
# Verify connection string
# Check database credentials
# Monitor connection pool usage
```

### Debug Mode

```bash
# Enable debug mode
DEBUG=* npm start

# Enable verbose logging
LOG_LEVEL=debug npm start

# Use debug endpoints
curl http://localhost:3000/api/debug/status
```

## Maintenance Procedures

### Regular Maintenance

```bash
# Daily checks
npm run health
npm run metrics

# Weekly maintenance
npm run maintenance:cleanup
npm run maintenance:optimize

# Monthly review
npm run security
npm run performance
```

### Log Rotation

```yaml
# logrotate configuration
/var/log/noorg/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 noorg noorg
}
```

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies safely
npm update

# Update major versions
npm run upgrade

# Security updates
npm audit fix
```

## Emergency Procedures

### Service Recovery

```bash
# Restart services
docker-compose restart

# Check service status
docker-compose ps

# View service logs
docker-compose logs -f coordinator
```

### Data Recovery

```bash
# From backup
cp backups/state-backup.json data/coordinator-state.json
docker-compose restart coordinator

# Emergency shutdown
docker-compose down
```

### Incident Response

1. **Identify the issue**: Check health endpoints and logs
2. **Isolate the problem**: Use circuit breakers and feature flags
3. **Notify stakeholders**: Use configured notification channels
4. **Implement fix**: Deploy hotfix or rollback
5. **Document incident**: Update incident log and procedures

## Support and Resources

### Getting Help

- **Documentation**: [Complete Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/ActiveInferenceInstitute/NoOrg/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ActiveInferenceInstitute/NoOrg/discussions)
- **Email**: support@noorg.local (for production issues)

### Monitoring Dashboards

- **Application Health**: http://localhost:3000/health
- **Metrics**: http://localhost:9090/metrics
- **Grafana Dashboard**: http://localhost:3001 (if configured)
- **API Documentation**: http://localhost:3000/api/docs

### Emergency Contacts

- **Primary Contact**: operations@yourcompany.com
- **Backup Contact**: devops@yourcompany.com
- **Emergency Phone**: +1-555-0123

---

*This deployment guide is maintained by the NoOrg operations team. Last updated: 2025-01-01*