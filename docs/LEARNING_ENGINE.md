# Learning Engine Architecture & Developmental Stages

EduKadence's Learning Engine is designed specifically for young children aged 2–10 (~200 students). It bridges play, exploration, and structured early childhood pedagogy without enterprise LMS bloat.

---

## 1. Six Developmental Stages

The learning engine structures the child's learning journey across 6 developmental stages:

| Level Code | Level Name | Age Bracket | Core Pedagogical Focus | UI / Interaction Style |
|---|---|---|---|---|
| `EXPLORE_2_3` | **Explore** | 2.0 – 3.0 | Colors, primary shapes, animal sounds, sensory matching | Giant visual buttons, minimal text, high audio cues |
| `DISCOVER_3_4` | **Discover** | 3.0 – 4.0 | Alphabet letters, counting 1–10, pattern recognition, story listening | Visual icons, 3–4 choice options, letter tracing |
| `LEARN_4_5` | **Learn** | 4.0 – 5.0 | Early phonics, rhyming, counting 1–20, voice-assisted storybooks | Interactive sentence exploration, picture puzzles |
| `BUILD_5_7` | **Build** | 5.0 – 7.0 | Reading preparation, basic addition & subtraction, logical reasoning | Interactive math tiles, structured story checkpoints |
| `CREATE_7_9` | **Create** | 7.0 – 9.0 | Reading comprehension, multiplication quests, nature science | Creative tasks, quizzes, chapter stories |
| `GROW_9_10` | **Grow** | 9.0 – 10.0 | Critical thinking challenges, independent learning sprints | Academic quizzes, speed logic, self-paced progress |

---

## 2. Core Curriculum Domains (`LearningArea`)

1. **Alphabet & Phonics (`ALPHABET_PHONICS`)**: Letter recognition, phonics sounds, early vocabulary.
2. **Numbers & Math (`NUMBERS_MATH`)**: Visual counting, number order, addition, shapes.
3. **Shapes & Colors (`SHAPES_COLORS`)**: Geometry identification, color mixing, sorting.
4. **Storybook Corner (`STORIES_AUDIO`)**: Interactive illustrated tales with narration.
5. **Science & Nature (`SCIENCE_NATURE`)**: Animal habitats, plant growth, weather, living things.
6. **Creativity & Art (`CREATIVITY_ART`)**: Drawing canvas, coloring palette, musical rhythms.

---

## 3. Server-Side Reward Calculation & Anti-Cheat

To maintain data integrity and prevent gamification abuse:
- The frontend client sends attempt results (`correct_count`, `total_count`, `answer_metadata`).
- The backend validates completion and calculates stars awarded (1 to 3 stars per activity based on accuracy).
- Progress and mastery percentages are updated in `LearningProgress`.
- Milestone badges (`RewardBadge`) are unlocked automatically when required star thresholds are met.
