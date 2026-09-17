# EduKadence — Authentication Lifecycle & Strategy

## 1. Authentication Architecture

EduKadence employs a stateless **JSON Web Token (JWT)** architecture powered by `djangorestframework-simplejwt`.

```
┌──────────┐                     ┌─────────────────┐                     ┌──────────┐
│  Client  │                     │ Django Backend  │                     │ Database │
└────┬─────┘                     └────────┬────────┘                     └────┬─────┘
     │                                    │                                   │
     │ 1. POST /api/v1/auth/login/        │                                   │
     │    { email, password }             │                                   │
     ├───────────────────────────────────►│                                   │
     │                                    │ 2. Query user & verify hash       │
     │                                    ├──────────────────────────────────►│
     │                                    │◄──────────────────────────────────┤
     │                                    │                                   │
     │ 3. Return { access, refresh, me }  │ 3. Sign JWTs with HS256 / RS256   │
     │◄───────────────────────────────────┤                                   │
     │                                    │                                   │
     │ 4. Request with Bearer AccessToken │                                   │
     ├───────────────────────────────────►│ 5. Validate signature & extract  │
     │                                    │    user_id / tenant context       │
     │                                    │                                   │
     │ 6. Response                        │                                   │
     │◄───────────────────────────────────┤                                   │
     │                                    │                                   │
     │ 7. AccessToken expired (401)       │                                   │
     │◄───────────────────────────────────┤                                   │
     │                                    │                                   │
     │ 8. POST /api/v1/auth/refresh/      │                                   │
     │    { refresh }                     │                                   │
     ├───────────────────────────────────►│ 9. Issue new AccessToken          │
     │◄───────────────────────────────────┤                                   │
```

---

## 2. Token Specifications

| Parameter | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Token Type** | Bearer JWT | Sliding Refresh JWT |
| **Default Lifespan**| 15–30 Minutes | 7–30 Days |
| **Payload Claims** | `user_id`, `email`, `exp`, `jti` | `user_id`, `token_type`, `exp`, `jti` |
| **Storage Location**| Memory / Secure Client Cache | HTTPOnly Secure Cookie or Storage |
| **Rotation** | Generated upon refresh | Rotated upon each refresh request |

---

## 3. Password Hashing Policy

EduKadence relies on Django's battle-tested cryptographic password management:
- **Default Algorithm**: `PBKDF2PasswordHasher` with SHA-256 (600,000+ iterations) or Argon2.
- **Salt Generation**: Cryptographically secure random salts (22+ characters).
- **Zero Plaintext**: Passwords are never stored, logged, or serialized in API responses.

---

## 4. Multi-Factor & Future Authentication Readiness

While Phase 1 implements clean Email/Password authentication, the user model and authentication endpoints are designed for seamless extension in future phases:
- **Mobile Number + SMS / WhatsApp OTP**: For rapid parent login on low-bandwidth connections.
- **Magic Link / Passwordless Auth**: For simplified teacher and parent access.
- **Kid Mode Quick PIN / QR Token**: Simplified 4-digit pictorial PIN or QR badge login for tablets in classroom environments.
