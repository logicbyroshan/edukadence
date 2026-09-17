# Learning Content & Data Model

This document outlines the entity relationships and JSON schemas powering EduKadence's Phase 3 learning content catalog.

---

## 1. Relational Entity Hierarchy

```mermaid
erDiagram
    LearningLevel ||--o{ LearningTopic : has
    LearningArea ||--o{ LearningTopic : contains
    LearningLevel ||--o{ Activity : categorizes
    LearningArea ||--o{ Activity : organizes
    LearningTopic ||--o{ Activity : structures
    Activity ||--o{ ActivityAttempt : generates
    Child ||--o{ ActivityAttempt : performs
    Child ||--o{ LearningProgress : tracks
    Child ||--o{ ChildBadge : earns
    RewardBadge ||--o{ ChildBadge : awards
    InteractiveStory ||--o{ StoryScene : contains
```

---

## 2. Publication States

Every activity adheres to explicit lifecycle states:
- `DRAFT`: Visible only to school admin / curriculum developers. Never exposed in Kid Mode.
- `PUBLISHED`: Verified and visible to children matching the developmental level.
- `ARCHIVED`: Historical activity no longer listed in active catalogs but preserving past attempt records.
