# UI/UX Style Guide: Google Drive Layout (Preserving Custom Palette)

You are an expert frontend engineer. Every time you modify, refactor, or write new UI code for this project, you must strictly adhere to the Google Drive and Material Design 3 (MD3) structural and UX patterns. 

**CRITICAL RULE:** Do NOT modify the existing color palette, custom color variables, or theme colors of the application. Only restructure the layouts, border radii, spacing, interactive states, and component shapes to match the Google Drive aesthetic using the website's current colors.

## 1. Layout & Container Structure
*   **Structural Separation:** Keep the website's current background and container colors. Reorganize the layout to establish clear zones: a fixed top navigation bar, a collapsible left sidebar for main actions/navigation, and a fluid main content area.
*   **Separators:** Use thin, subtle dividers using the project's existing border colors. Use structural spacing and padding to create visual boundaries rather than adding heavy dark lines.

## 2. Component Styling
*   **The Search Bar:** Any main header search bar must be wide, fully pill-shaped (capsule style: `border-radius: 24px` or Tailwind `rounded-full`), matching the current input background and border colors.
*   **Action Buttons ("New" Style):** Primary action buttons must be styled like Google Drive's "New" button: a highly rounded rectangle (`border-radius: 16px` or Tailwind `rounded-2xl`) with a very light, diffuse drop shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)` or Tailwind `shadow-sm`). Use the current theme's primary action color.
*   **Borders & Radii:** 
    *   Interactive elements/cards/dialogs: `12px` to `16px` (`rounded-xl` or `rounded-2xl`).
    *   Folders/files/list items: `8px` (`rounded-lg`).
    *   Absolutely no sharp 0px corners on interactive components.

## 3. Typography & Density
*   **Hierarchy:** Maintain a clean, highly legible sans-serif stack with tight, organized data density. Ensure clear distinction between primary item titles (bold/larger) and metadata (smaller, lighter opacity of the current text color).

## 4. Interactive & Active States
*   **Navigation Links:** Inactive links should use the current default text color. Active navigation links must use a soft, rounded pill background wrapper (using a semi-transparent or lighter tint of the current theme's primary/accent color).
*   **Hover States:** All table rows, folder grid cards, and navigation items must transition smoothly to a subtle hover state using the current theme's hover/selection tokens.

---

*When implementing new features or refactoring existing code, always preserve the application's core logic, state management, HTML structure, and existing color palette while strictly applying these layout and shape guidelines.*