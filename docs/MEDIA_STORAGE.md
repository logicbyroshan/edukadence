# EduKadence — Media Storage & Asset Architecture

## 1. Media Assets in EduKadence

EduKadence handles two distinct categories of media assets:

1. **System & Brand Media (Static)**:
   - EduKadence brand logos, mascot vectors, UI icons, and Kid Mode illustrative assets.
   - Handled via Vite asset bundling and distributed via CDN / Nginx.
2. **Tenant-Generated Media (Dynamic)**:
   - School logos & branding banners.
   - User profile avatars.
   - *Future Phases*: Classroom daily activity photos, homework recordings, story audio, and learning videos.

---

## 2. Storage Strategy

- **Development**: Local filesystem storage via Django `MEDIA_ROOT` and `MEDIA_URL` (`/media/`).
- **Production**: S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, or DigitalOcean Spaces) via `django-storages`.
- **Tenant Path Partitioning**: Tenant-generated assets are partitioned in object storage by school UUID:
  ```
  s3://edukadence-media/
    schools/{school_id}/
      branding/logo.png
      avatars/{user_id}.jpg
      activities/{activity_id}/{photo_id}.webp
  ```
- **Privacy & Signed URLs**: Private media (student activity photos, student records) will utilize pre-signed expiring URLs to ensure unauthorized access is prevented.
