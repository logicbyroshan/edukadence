# Project Memory: Code & Workflow Conventions

## 1. Backend Conventions (Django / DRF)

### Naming & Structure
- **Models**: PascalCase (e.g., `SchoolMembership`, `AcademicYear`, `SchoolSetting`). Explicit `db_table` names in snake_case plural (e.g., `db_table = 'school_memberships'`).
- **Primary Keys**: Always `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
- **Timestamps**: All models inherit `TimeStampedModel` (`created_at`, `updated_at`).
- **Serializers**: Named `<Model>Serializer` (e.g., `SchoolSerializer`). Nested representation for reads, flat IDs for writes.
- **Views**: Use DRF `ModelViewSet` for resource CRUD and `APIView` for specific operational endpoints.
- **URLs**: Plural kebab-case resource paths (e.g., `/api/v1/schools/academic-years/`).

### API Error Handling & Responses
- All unhandled exceptions and validation errors are intercepted by `custom_exception_handler` in `apps.core.exceptions`.
- Output payload structure:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid data was submitted.",
      "details": { "field": ["Error description"] }
    }
  }
  ```

---

## 2. Frontend Conventions (React / Vite)

### Technology Standards
- **Pure JavaScript**: Use `.jsx` for React components and `.js` for utilities/services. **Do not use TypeScript.**
- **File Naming**:
  - Components & Pages: PascalCase (e.g., `Button.jsx`, `DashboardPage.jsx`, `AppShell.jsx`).
  - Services, Hooks & Libs: camelCase (e.g., `apiClient.js`, `useAuth.jsx`, `tokenStorage.js`).
- **Design Tokens**: Color tokens derived from the EduKadence logo:
  - Electric Blue: `brand-600` (`#2563EB`)
  - Sky Blue: `skybrand-500` (`#0EA5E9`)
  - Dark Slate Navy: `navy-900` (`#0F172A`)
  - Neutral Background: `slate-50` (`#F8FAFC`)
  - Card Surface: `white` (`#FFFFFF`)
- **No Ad-Hoc Styles**: Always reuse primitives from `src/components/ui/` (`Button`, `Input`, `Card`, `Modal`, `Table`, `Badge`, `Alert`, `EmptyState`, `LoadingState`, `ErrorState`, `Pagination`, etc.).

---

## 3. Git Branching & Pull Request Workflow

> [!IMPORTANT]
> **MANDATORY CHANGE WORKFLOW USING GITHUB CLI:**
> Every single change (feature, bug fix, refactor, chore) MUST follow this strict branching and PR lifecycle.

1. **Branch Naming**:
   - `feat/<description>` — New features
   - `fix/<description>` or `bug/<description>` — Bug fixes
   - `docs/<description>` — Documentation changes
   - `chore/<description>` — Maintenance / configuration
2. **Branch Creation**:
   ```bash
   git checkout -b <branch-name>
   ```
3. **Commit Convention**: Conventional Commits:
   - `feat(scope): ...`
   - `fix(scope): ...`
   - `docs(scope): ...`
   - `chore(scope): ...`
4. **Push & Create PR**:
   ```bash
   git push origin <branch-name>
   gh pr create --title "<type>(<scope>): <summary>" --body "<description of changes and verification>"
   ```
5. **Merge PR via GH CLI**:
   ```bash
   gh pr merge --merge --delete-branch
   ```
6. **Local Sync**:
   ```bash
   git checkout main && git pull origin main
   ```
