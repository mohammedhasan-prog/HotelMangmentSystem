# Design System Specification: The Elevated Voyager

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Concierge"**
The objective of this design system is to transcend the transactional nature of booking and move toward an editorial, hospitality-first experience. While inspired by the efficiency of industry leaders, this system rejects the "cluttered marketplace" aesthetic in favor of **Sophisticated Composition**.

We achieve this through **Intentional Asymmetry** (overlapping imagery with floating text blocks), **Tonal Depth** (layering surfaces instead of drawing lines), and **Typographic Authority** (using dramatic scale shifts to guide the eye). The result is a layout that feels curated, not just populated.

---

## 2. Color Strategy: Tonal Sophistication
We utilize a palette rooted in deep authority (`primary`) and kinetic energy (`secondary`). However, the "premium" feel is generated in the neutrals.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. 
*   **The Technique:** Boundaries must be defined solely through background color shifts. For example, a search module using `surface-container-low` should sit directly on a `surface` background. The transition of tone is the border.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine stationery or frosted glass.
*   **Level 0 (Base):** `surface` (#fcf9f8) – The canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f6f3f2) – Used for large background blocks (e.g., "Trending Destinations").
*   **Level 2 (Interactive):** `surface-container-highest` (#e5e2e1) – Reserved for cards or modules that require the most prominence.

### The "Glass & Gradient" Rule
To avoid a flat, "Bootstrap" appearance, use **Glassmorphism** for floating headers and sticky navigation. 
*   **Spec:** Apply `surface` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** For Hero CTAs, use a subtle linear gradient from `primary` (#031632) to `primary-container` (#1a2b48) at a 135° angle to add "soul" and depth to the action.

---

## 3. Typography: The Editorial Voice
We utilize **Inter** to bridge the gap between high-end editorial and functional clarity.

*   **Display (The Hook):** `display-lg` (3.5rem) should be used sparingly for high-impact brand moments. Use `-2%` letter spacing to feel "tucked" and professional.
*   **Headlines (The Story):** `headline-md` (1.75rem) serves as the primary section header. Ensure 1.2x line-height to maintain a compact, authoritative look.
*   **Body (The Service):** `body-lg` (1rem) for descriptions. Use `on-surface-variant` (#44474d) to reduce visual vibration and improve long-form readability.
*   **Hierarchy Tip:** Pair a `label-sm` (all-caps, +5% tracking) in `tertiary_fixed_dim` (Gold) above a `headline-lg` to create a "Pre-header" editorial style.

---

## 4. Elevation & Depth
Depth in this design system is a result of **Tonal Layering**, not structural scaffolding.

*   **The Layering Principle:** Instead of shadows, stack `surface-container-lowest` (#ffffff) cards on top of `surface-container-low` (#f6f3f2) backgrounds. This creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** When a card must "float" (e.g., a hovered hotel card), use a shadow of `0px 12px 32px rgba(28, 27, 27, 0.06)`. The tint is derived from `on-surface`, ensuring it looks like a natural shadow, not a "dirty" grey.
*   **The Ghost Border Fallback:** If accessibility requires a border (e.g., Input Fields), use `outline-variant` (#c5c6ce) at **15% opacity**. It should be felt, not seen.

---

## 5. Component Guidelines

### Buttons: The Kinetic Engine
*   **Primary:** `primary` (#031632) background, `on-primary` text. No border. `radius-md` (0.75rem).
*   **Secondary:** `secondary_container` (#1070e8) background. This is for high-priority actions like "Book Now."
*   **States:** On hover, apply a `surface-tint` overlay at 8% opacity.

### Cards: The Property Showcase
*   **Styling:** Forbid all divider lines.
*   **Layout:** Use `xl` (1.5rem) spacing between the image and the content block. Use `surface-container-lowest` for the card background.
*   **Imagery:** Always utilize a slight `4px` inset for images within cards to create a "framed" gallery feel.

### Input Fields: Minimalist Utility
*   **Visuals:** Background `surface-container-lowest`, bottom-only "Ghost Border" (15% opacity).
*   **Focus:** Transition the bottom border to `secondary` (#0058bc) at 2px thickness.

### Status Indicators & Badges
*   **Available:** `secondary_fixed` background with `on-secondary-fixed-variant` text.
*   **Ratings:** Use `tertiary_fixed_dim` (#fbbc09) for stars/scores to provide the "Gold Standard" association.

### Key Additional Component: The "Floating Date Picker"
A glassmorphic module using `surface` at 90% opacity, `24px` blur, and an `ambient shadow`. This should feel like it is resting gently on top of the map or gallery.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use white space as a structural element. If you think you need a line, try adding `24px` of padding instead.
*   **Do** overlap elements. Let a hotel price badge overlap the property image by `12px` to break the grid.
*   **Do** use `on-surface-variant` for secondary information to create a clear visual hierarchy.

### Don't:
*   **Don't** use 100% black (#000000). Always use `on-surface` (#1c1b1b) for text to maintain a premium, "ink-on-paper" look.
*   **Don't** use high-contrast shadows. If the shadow is the first thing you see, it is too dark.
*   **Don't** use standard 4px corners. Stick to the `md` (0.75rem) and `lg` (1rem) tokens to maintain a modern, friendly, yet professional silhouette.