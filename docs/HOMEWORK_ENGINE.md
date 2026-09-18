# EduKadence Interactive Homework & Assignment Engine (Phase 4)

## 1. Architectural Philosophy

The EduKadence Homework Engine orchestrates and reuses the **Phase 3 Activity Engine** rather than creating a duplicate quiz or homework system.

```text
                    ┌───────────────────────────┐
                    │  EduKadence Content Bank  │
                    │   (Phase 3 Activity Bank) │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Phase 3 Activity Engine │
                    └─────────────┬─────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
     Independent Kid Learning             Teacher Homework Quest
                 │                                 │
                 │                        ┌────────▼────────┐
                 │                        │ Homework Model  │
                 │                        └────────┬────────┘
                 │                                 │
                 │                        ┌────────▼────────┐
                 │                        │ Assignment Model│
                 │                        └────────┬────────┘
                 │                                 │
                 └────────────────┬────────────────┘
                                  │
                           ┌──────▼──────┐
                           │  Kid Mode   │
                           └──────┬──────┘
                                  │
                          Activity Attempts
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
           Learning Progress             Homework Progress
           (Topic Mastery)               (Class Roster / Feedback)
                   │                             │
             Parent View                    Teacher View
```

---

## 2. Core Data Models

### 2.1 Homework (`apps.learning.models.Homework`)
- **Tenant Isolation**: Inherits from `TenantAwareModel` (`school_id`).
- **Fields**:
  - `title`, `instructions`, `learning_area`, `topic`, `target_level`, `difficulty`, `estimated_minutes`
  - `status`: `DRAFT`, `REVIEW`, `PUBLISHED`, `ARCHIVED`
  - `version`: Safe content versioning
  - `created_by`: Foreign key to `User` (`is_teacher_or_admin`)
  - `activities`: Many-to-many relationship through `HomeworkActivity`

### 2.2 HomeworkActivity (`apps.learning.models.HomeworkActivity`)
- Connects a `Homework` set with a specific `Activity` from the library or authored bank.
- `order`: Positive integer defining sequential activity progression.
- `required_to_complete`: Boolean flag for completion calculation.

### 2.3 HomeworkAssignment (`apps.learning.models.HomeworkAssignment`)
- **Targeting**: `SECTION`, `CLASS`, or `INDIVIDUAL`.
- **Fields**:
  - `homework`: Reference to `Homework`.
  - `section`: Target `Section` roster.
  - `assigned_by`: Teacher user.
  - `available_from`, `due_date`: Scheduling window.
  - `status`: `DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`.
  - `notes`: Custom teacher note for the class.

### 2.4 ChildHomeworkProgress (`apps.learning.models.ChildHomeworkProgress`)
- Auto-instantiated for all enrolled active children when an assignment is published or saved.
- **Fields**:
  - `assignment`: `HomeworkAssignment`
  - `child`: `Child`
  - `status`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`
  - `completed_activities_count`, `total_activities_count`
  - `average_score`, `total_stars_earned`
  - `teacher_feedback`, `teacher_feedback_at`, `teacher_feedback_by`

---

## 3. Assignment Lifecycle & Publishing Flow

1. **Authoring / Scaffolding**: Teacher creates or selects activities in the Activity Studio.
2. **Quest Bundling**: Teacher bundles activities into a Homework quest with estimated minutes and instructions.
3. **Class Scheduling**: Teacher assigns to a Section or Class with start and due dates.
4. **Publishing**: When marked `PUBLISHED`, `ChildHomeworkProgress` records are seeded for all enrolled students in the section.
5. **Child Execution**: In Kid Mode (`/kid`), active quests appear under "Today's Learning Quests".
6. **Progress Tracking**: Completing each activity fires `submit_attempt` which records the attempt, calculates progress, awards safe stars, and updates `ChildHomeworkProgress`.
7. **Teacher Review**: Teacher opens the assignment in Learning Studio, views class metrics and individual child cards, and stamps encouraging feedback notes.
8. **Parent Transparency**: Parents view assigned homework quests, stars, and personalized teacher notes in the Parent Portal (`/parent/learning`).

---

## 4. Security & Tenant Boundaries

- **Strict Multi-Tenancy**: School A teachers cannot view, assign, or edit School B homework or activities.
- **Child Authorization**: Children can only submit attempts for their own assigned homework.
- **Draft Protection**: Activities in `DRAFT` or `REVIEW` are strictly shielded from students and parents.
- **Private Media**: Media assets are referenced securely through tenant-aware UUIDs.
