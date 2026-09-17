# Kid Mode Architectural Specification

Kid Mode in EduKadence is a restricted, safe, visual learning environment designed specifically for young children (ages 2–10).

---

## 1. Core Principles

1. **Restricted Sandbox**: Kid Mode never exposes adult administrative controls, school fees, payment records, parent/teacher phone numbers, settings, or external links.
2. **Adult Math-Gate Exit**: To prevent young toddlers from accidentally exiting Kid Mode into adult dashboards, exiting requires solving an adult math verification challenge.
3. **Multi-Sibling Support**: Seamless child profile switching from the top header allows families with multiple children to switch learning universes in 1 tap.
4. **Adaptive Scaling**: Layouts, button touch targets, and typography dynamically scale according to the child's developmental stage.
5. **No Manipulation or Addictive Loops**: No loot boxes, no infinite scrolls, no countdown pressure, and no public leaderboards.

---

## 2. Kid Mode Views & Routes

- `/kid`: Personalized Home World with Continue Adventure, Today's Challenge, Recommended Activities, and Category Carousels.
- `/kid/explore`: Universe Explorer filtered by developmental level (`Explore 2–3`, `Discover 3–4`, `Learn 4–5`, `Build 5–7`, `Create 7–9`, `Grow 9–10`).
- `/kid/stories`: Interactive storybook corner with scene-by-scene narration and checkpoints.
- `/kid/videos`: Curated safe video room.
- `/kid/badges`: "My World" trophy chest with total stars, unlocked badges, and topic progress trees.
