# EduKadence — Local Development & Contribution Guide

## 1. Local Environment Setup

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: v18.0.0 or higher (with npm 9+)
- **Git**: 2.30+
- **PostgreSQL**: 15+ (Optional: SQLite is supported for rapid local backend test running)

---

## 2. Backend Setup (Django + DRF)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run database migrations
python manage.py migrate

# 6. Seed demo development dataset
python manage.py seed_dev_data

# 7. Start development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be accessible at: `http://localhost:8000/api/v1/`

---

## 3. Frontend Setup (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173/`

---

## 4. Running Automated Tests

```bash
# Run all backend tests with verbose output
cd backend
pytest tests/ -v

# Run tenant isolation security tests specifically
pytest tests/test_tenant_isolation.py -v

# Run frontend build check
cd ../frontend
npm run build
```

---

## 5. Seeding Demo Data

The custom management command `seed_dev_data` prepares an instant sandbox:
```bash
python manage.py seed_dev_data
```

This creates:
- School: **Little Sprouts Montessori** (`little-sprouts-montessori`)
- Academic Year: **2026-2027** (Active)
- Users:
  - Super Admin: `admin@edukadence.com` / `Admin@12345`
  - School Admin: `principal@littlesprouts.edu` / `School@12345`
  - Teacher: `sarah.teacher@littlesprouts.edu` / `Teacher@12345`
  - Parent: `john.parent@gmail.com` / `Parent@12345`
  - Child: `leo.kid` / `Kid@12345`
