# Activity Engine Specification

EduKadence's Activity Engine utilizes a data-driven registry pattern to render 12 distinct interactive activity types for early childhood education without hardcoding individual page components.

---

## 1. Supported Activity Types

| Type Code | Activity Name | Interaction Mechanism |
|---|---|---|
| `TAP_CHOOSE` | **Tap & Choose** | Single-tap visual multi-choice with large emoji icons and immediate feedback. |
| `COUNT` | **Visual Counting** | Interactive touchable object grid with tap animations and numerical selection. |
| `MATCH` | **Pair Matcher** | Interactive connection between paired concepts (e.g. animals to habitats). |
| `SORT` | **Sort & Classify** | Categorizing objects into target boxes (e.g. Big vs Small, Colors). |
| `MEMORY` | **Memory Card Flip** | Shuffled flip card grid with pair discovery. |
| `SEQUENCE` | **Sequence & Ordering**| Number, alphabet, or size ordering with chronological slot filling. |
| `TRACE` | **Letter & Shape Tracing**| Interactive HTML5 canvas tracing with mouse/touch stroke detection. |
| `COLOR` | **Color & Paint** | Palette picker with interactive color filling of illustration elements. |
| `QUIZ` | **Interactive Quiz** | Multi-step checkpoint questions with visual options. |
| `DRAG_DROP` | **Drag & Drop** | Click-to-move / drag items into a target destination. |
| `STORY` | **Story Interaction** | Scene-by-scene illustrated storybook reader with text narration and comprehension questions. |
| `VIDEO` | **Curated Video** | HTML5 video player with comprehension checkpoint. |

---

## 2. Activity Runner Workflow

```mermaid
graph TD
    A[Child clicks Activity] --> B[ActivityRunner mounts]
    B --> C[Fetch Activity Content Schema]
    C --> D[Render specific Activity Sub-Component]
    D --> E[Child interacts & completes]
    E --> F[POST /api/v1/learning/activities/{id}/submit_attempt/]
    F --> G[Server calculates Score & Stars]
    G --> H[Update LearningProgress & Award Badges]
    H --> I[Render Joyful Celebration Modal ⭐]
```
