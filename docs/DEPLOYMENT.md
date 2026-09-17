# EduKadence — Deployment Architecture & Operations

## 1. Production Deployment Philosophy

EduKadence is designed for **low operational overhead and cost-efficiency**. Because target schools are small (~200 students), a single small managed PostgreSQL database coupled with containerized Django and Nginx services can easily support hundreds of schools.

---

## 2. Containerized Production Setup

The system includes production-ready multi-stage Dockerfiles:
- `infra/docker/Dockerfile.backend`: Gunicorn WSGI server running Python 3.11 with optimized non-root user execution.
- `infra/docker/Dockerfile.frontend`: Multi-stage build producing static HTML/JS assets served via Nginx with Brotli/Gzip compression and client-side routing fallbacks.
- `docker-compose.yml`: Local & staging orchestration.

---

## 3. Production Environment Checklist

Before deploying to production, verify the following:

- [ ] `DEBUG=False` in Django settings.
- [ ] `DJANGO_SECRET_KEY` is set to a 50+ character cryptographically secure string.
- [ ] `ALLOWED_HOSTS` is restricted to the specific production domains.
- [ ] `CORS_ALLOWED_ORIGINS` is restricted to the frontend production origin.
- [ ] `SECURE_SSL_REDIRECT=True` and `SESSION_COOKIE_SECURE=True`.
- [ ] PostgreSQL connection pool is sized appropriately (e.g. 10–20 connections).
- [ ] Automated daily database backups with WAL archiving.
- [ ] S3-compatible bucket configured for uploaded school logos and student media.

---

## 4. Recommended Cloud Hosting Platforms

1. **PaaS (Lowest Operational Complexity)**:
   - Render / Railway / Fly.io / DigitalOcean App Platform.
   - 1x Web Service (Django + Gunicorn), 1x Static Site (React/Vite), 1x Managed PostgreSQL.
2. **Container VPS / ECS (High Performance / Control)**:
   - AWS ECS Fargate or Hetzner VPS with Docker Compose.
   - Reverse proxy with Nginx and Let's Encrypt SSL.
