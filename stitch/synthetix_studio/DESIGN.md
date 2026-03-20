# Design System Specification: The Precision Interface

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Architectural Monolith."** 

In the world of developer tools, clarity is often sacrificed for density. This system rejects that compromise. We move beyond the "standard SaaS dashboard" by treating the UI as a high-precision instrument. It is built on a foundation of tonal depth and structural silence—where the absence of lines creates a more focused environment for CSS manipulation. 

We break the "template" look through **intentional asymmetry**: sidebars are not mere boxes but integrated architectural wings, and the central canvas is a "sacred space" that uses maximum breathing room to elevate the user's work.

## 2. Colors & Surface Philosophy
The palette is rooted in the `background` (#0c0e11), a deep, obsidian slate. We utilize a "dark mode first" strategy to minimize eye strain during long coding sessions.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural definition must be achieved through **Background Color Shifts**. 
*   **The Canvas:** Uses `surface_container_lowest` (#000000) to create an infinite void for the project preview.
*   **The Tool Panels:** Use `surface_container` (#171a1d) to sit naturally against the background.
*   **Active Selection:** Use `surface_container_highest` (#23262a) to draw the eye to the currently active property group.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested plates. 
- **Level 0 (Base):** `surface` (#0c0e11).
- **Level 1 (Panels):** `surface_container_low` (#111417).
- **Level 2 (Inputs/Cards):** `surface_container` (#171a1d).
- **Level 3 (Pop-overs):** `surface_bright` (#292c31).

### The "Glass & Gradient" Rule
To inject "soul" into the technical precision:
*   **Floating Modals:** Utilize `surface_bright` at 80% opacity with a `20px` backdrop-blur. 
*   **Primary CTAs:** Do not use flat blue. Apply a subtle linear gradient from `primary` (#9ba8ff) to `primary_dim` (#4963ff) at a 135-degree angle. This creates a tactile, "lit" quality that feels premium.

## 3. Typography
We employ a dual-font strategy to balance editorial authority with technical utility.

*   **Display & Headlines (Manrope):** Used for high-level navigation and section titles. The geometric nature of Manrope provides a "designed" feel that counters the rigidity of code.
*   **Body & Labels (Inter):** The workhorse. Use `body-md` (0.875rem) for most property labels to maintain high information density without sacrificing legibility.
*   **Code & Values (Roboto Mono):** All CSS property values, hex codes, and snippets must use Roboto Mono. This creates a clear visual distinction between "UI Text" and "User Data."

**Hierarchy Note:** Use `on_surface_variant` (#aaabaf) for inactive labels and `on_surface` (#f9f9fd) for active values. This creates a natural "Visual Dimming" effect that guides the user's focus.

## 4. Elevation & Depth
In this system, elevation is a function of light, not lines.

*   **The Layering Principle:** A property inspector card should not have a border. Instead, place the `surface_container_high` card on a `surface_container_low` sidebar. The 4% shift in luminance is sufficient for the human eye to perceive a boundary.
*   **Ambient Shadows:** For floating color pickers or menus, use an extra-diffused shadow: `0px 16px 48px rgba(0, 0, 0, 0.5)`. The shadow color must be derived from the background, never pure black, to keep the "slate" tone consistent.
*   **The Ghost Border:** If a component requires a boundary for accessibility (e.g., a text input), use the `outline_variant` (#46484b) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Precise Sliders
*   **Track:** `surface_container_highest`. 
*   **Handle:** `primary` (#9ba8ff). 
*   **Interaction:** On hover, the handle grows by `2px` using a `0.2s` ease-out transition. Show the numerical value in a `label-sm` tooltip above the handle only during interaction.

### Color Pickers
*   **Geometry:** Use `md` (0.375rem) rounded corners for the palette area.
*   **Inputs:** Hex values must be in Roboto Mono. Use `surface_container_low` for the input background to "inset" it into the picker UI.

### Buttons
*   **Primary:** Gradient (Primary to Primary-Dim), `on_primary_container` text. `sm` (0.125rem) roundedness for a "sharp" technical feel.
*   **Secondary:** Ghost style. No background, `outline` color for text. On hover, shift background to `surface_variant`.

### Cards & Lists
*   **The Divider Ban:** Never use horizontal lines to separate list items. Use the `0.5` (0.1rem) or `1` (0.2rem) spacing tokens to create rhythmic gaps. If separation is needed, use a alternating background tint (Zebra striping) using `surface_container_low` and `surface_container`.

### The Canvas Controller (Contextual Component)
*   A floating bar at the bottom of the central canvas for zoom/viewport controls. 
*   **Style:** Glassmorphic. `surface_bright` at 60% opacity, `blur: 12px`. This ensures the user's design is visible "underneath" the tool.

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetric Padding:** Use `spacing.6` on the left and `spacing.4` on the right of sidebars to create a directional flow toward the central canvas.
*   **Embrace "Empty" Space:** If a panel only has two controls, don't stretch them. Let the dark background provide a "calm" area for the eyes.
*   **Color as Signal:** Reserve `primary` and `tertiary` colors strictly for active states or successful actions. 

### Don't:
*   **Don't use pure white (#FFFFFF):** Use `on_surface` (#f9f9fd). Pure white on a deep slate background causes "halation" (a visual vibrating effect) that hurts the eyes.
*   **Don't use 100% Opaque Borders:** This shatters the "Monolith" feel. If you need a line, it must be a "Ghost Border" at <20% opacity.
*   **Don't use standard easing:** Use `cubic-bezier(0.16, 1, 0.3, 1)` for all transitions. This "expo-out" curve feels faster and more "engineered."