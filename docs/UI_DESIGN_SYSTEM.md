# EduKadence — UI Design System & Visual Identity

## 1. Visual Brand Philosophy

EduKadence features a **friendly, modern, sophisticated, and minimal** visual identity. It is derived directly from the EduKadence logo color family:
- **Electric Blue**: Primary brand driver, accentuating key actions and focal points.
- **Sky Blue**: Informational accents, highlights, badges, and cheerful interactive cues.
- **Deep Sky / Slate Navy**: High-contrast typography and structural framing.
- **White & Clean Neutral Surfaces**: Dominant background aesthetic for clarity and high productivity.

> **Crucial Rule**: The professional School and Parent interfaces must never look like a chaotic cartoon dashboard. The child interface in Kid Mode is playful, but the overarching brand identity is premium, trustworthy, and calm.

---

## 2. Design Tokens

### Color Palette (Tailwind & CSS Variables)
```css
:root {
  /* Brand Primary Blues */
  --color-brand-50:  #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-200: #bfdbfe;
  --color-brand-300: #93c5fd;
  --color-brand-400: #60a5fa;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb; /* Primary Electric Blue */
  --color-brand-700: #1d4ed8;
  --color-brand-800: #1e40af;
  --color-brand-900: #1e3a8a;
  --color-brand-950: #172554;

  /* Sky Blue Accents */
  --color-sky-400:   #38bdf8;
  --color-sky-500:   #0ea5e9; /* Cheerful Sky Accent */
  --color-sky-600:   #0284c7;

  /* Neutral Slate Surfaces */
  --color-surface-bg:   #f8fafc;
  --color-surface-card: #ffffff;
  --color-surface-subtle: #f1f5f9;
  --color-surface-border: #e2e8f0;
  
  /* Text Neutrals */
  --color-text-primary:   #0f172a; /* Deep Slate Navy */
  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;

  /* Semantic Feedback */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #0ea5e9;
}
```

---

## 3. Typography Scale

EduKadence uses modern, highly readable sans-serif typography (`Inter` / system stack) with clean optical tracking and hierarchy:

| Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display` | 32px (2rem) | Bold (700) | 1.2 | Landing headers, Kid Mode banners |
| `heading-1`| 24px (1.5rem) | SemiBold (600) | 1.3 | Page Titles, Primary dashboard titles |
| `heading-2`| 20px (1.25rem)| SemiBold (600) | 1.35 | Section headers, Card titles, Modal headings |
| `heading-3`| 16px (1rem) | Medium (500) | 1.4 | Subsection titles, Table headers |
| `body` | 14px (0.875rem)| Regular (400) | 1.5 | Standard text, inputs, data grid cells |
| `small` | 12px (0.75rem)| Regular (400) | 1.5 | Help text, metadata timestamps, badges |
| `button` | 14px (0.875rem)| Medium (500) | 1.0 | Action triggers, buttons |

---

## 4. Reusable UI Primitives (25+ Components)

All primitives reside under `frontend/src/components/ui/` with zero external bloat:

1. **`Button`**: Primary, Secondary, Outline, Ghost, Danger variants with loading spinner and disabled states.
2. **`IconButton`**: Accessible icon button wrapper with tooltip support.
3. **`Input`**: Text, email, password, search inputs with leading/trailing icons and validation error states.
4. **`Select`**: Custom styled native dropdown select.
5. **`Textarea`**: Multi-line text input with automatic focus ring.
6. **`Checkbox`**: Accessible custom checkbox with keyboard focus state.
7. **`Radio` / `RadioGroup`**: Styled single-select radio options.
8. **`Toggle`**: Accessible toggle switch.
9. **`Badge`**: Neutral, Brand Blue, Success, Warning, Error status chips.
10. **`Avatar`**: Image avatar with automatic initials fallback and status dot.
11. **`Card`**: Elevated white surface with consistent padding, subtle border, and optional header/footer.
12. **`Modal`**: Accessible dialog overlay with escape key dismissal and focus trapping.
13. **`Drawer`**: Responsive slide-over panel for details and mobile navigation.
14. **`Dropdown`**: Popover menu with action triggers, icons, and keyboard navigation.
15. **`Toast`**: Context-driven toast notifications (Success, Error, Info, Warning).
16. **`Alert`**: Inline contextual alert box with icons.
17. **`Tabs`**: Tabbed interface with smooth active indicator.
18. **`Table`**: Responsive data table with header styling, hover rows, and empty state support.
19. **`EmptyState`**: Illustrated empty state with title, description, and primary call-to-action.
20. **`LoadingState`**: Centered spinner and skeleton loaders.
21. **`ErrorState`**: Friendly error screen with retry trigger.
22. **`Pagination`**: Previous/Next controls, page number list, and page size dropdown.
23. **`Breadcrumb`**: Hierarchical navigation breadcrumb trail.
24. **`PageHeader`**: Standard page header containing breadcrumbs, title, subtitle, and action buttons.
25. **`FormField`**: Wrapper component combining label, required indicator, input control, and error text.
26. **`ConfirmDialog`**: Pre-built confirmation dialog for destructive or critical actions.

---

## 5. Accessibility (a11y) & Responsive Standards

- **Focus Rings**: High-contrast blue focus rings (`focus:ring-2 focus:ring-brand-500 focus:outline-none`) for all keyboard navigations.
- **Touch Targets**: Minimum `44px x 44px` touch targets for mobile viewport compatibility.
- **Contrast Ratios**: WCAG 2.1 AA compliant text contrast across all color combinations.
