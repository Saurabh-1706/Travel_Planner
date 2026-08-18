---
name: Nocturnal Wanderer
colors:
  surface: '#121212'
  surface-dim: '#0e0e0e'
  surface-bright: '#1c1c1c'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c8c2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c928d'
  outline-variant: '#424844'
  surface-tint: '#b0cdbb'
  primary: '#cce9d6'
  on-primary: '#1c3529'
  primary-container: '#b0cdbb'
  on-primary-container: '#3e584a'
  inverse-primary: '#4a6455'
  secondary: '#aacbe0'
  on-secondary: '#113445'
  secondary-container: '#2a4b5c'
  on-secondary-container: '#99bace'
  tertiary: '#ffdad8'
  on-tertiary: '#462828'
  tertiary-container: '#eabbba'
  on-tertiary-container: '#6c4949'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ccead7'
  primary-fixed-dim: '#b0cdbb'
  on-primary-fixed: '#062015'
  on-primary-fixed-variant: '#324c3e'
  secondary-fixed: '#c6e7fd'
  secondary-fixed-dim: '#aacbe0'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#2a4b5c'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#eabbba'
  on-tertiary-fixed: '#2e1414'
  on-tertiary-fixed-variant: '#5f3e3e'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  on-surface-primary: '#fcf9f8'
  on-surface-secondary: '#a1a1a1'
  on-surface-tertiary: '#6e6e6e'
  accent-green-vibrant: '#2ecc71'
  accent-blue-vibrant: '#3498db'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: 0em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '300'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 20px
  section-gap: 80px
  container-max: 1440px
---

## Brand & Style
The design system transitions into a sophisticated, low-light editorial experience designed for evening discovery and immersive planning. The brand personality remains premium and tranquil, but shifts toward a "Midnight Concierge" aesthetic.

The chosen style is **Dark-Minimalist Editorial**. It leverages deep charcoal surfaces to make high-end travel photography "pop" with cinematic intensity. By utilizing light-sensitive typography and glowing accents, the UI evokes the feeling of browsing a luxury gallery under dimmed lights. The emotional response is one of exclusivity, focus, and modern elegance, moving away from the airy daytime feel to a more intimate, focused digital environment.

## Colors
The dark mode palette is grounded in "Deep Charcoal" rather than pure black to preserve detail and reduce ocular fatigue.

- **Primary Surfaces:** The core background is a rich near-black (#121212). `surface-dim` is used for recessed areas like the sidebar, while `surface-bright` provides elevation for cards.
- **Accents:** The nature-inspired greens and blues are shifted toward their pastel/desaturated counterparts (`#b0cdbb` and `#aacbe0`) to maintain a high "luminous" quality against dark backgrounds without causing vibration.
- **Typography Contrast:** Primary text uses a soft off-white to prevent harsh "haloing," while secondary and tertiary text utilize scaled grays to establish a clear information hierarchy.

## Typography
Typography in dark mode requires adjustments to weight and tracking to account for the "ink bleed" effect of light text on dark backgrounds.

- **Headline Treatment:** **Playfair Display** remains the editorial anchor. At large sizes, letter-spacing is slightly opened compared to light mode to ensure the high-contrast serifs remain distinct.
- **UI & Body:** **Geist** is introduced for its technical precision and superior legibility in low-light environments. Body weights are dropped to `300` (Light) to prevent the text from appearing too "bold" or blurry on dark displays.
- **Hierarchy:** Use `label-lg` with increased letter-spacing and uppercase styling for small headers to create a rhythmic, architectural feel.

## Layout & Spacing
The layout maintains the **Fixed Sidebar + Fluid Content** model but uses negative space more aggressively to define boundaries where shadows cannot.

- **Grid:** A standard 12-column system where the background acts as a deep void, allowing content modules to float.
- **Sidebar:** The 280px navigation area is treated as `surface-dim`, creating a subtle "anchor" on the left side of the screen.
- **Rhythm:** `section-gap` (80px) is vital; in dark mode, whitespace (or "darkspace") serves as a visual cleanser that prevents the UI from feeling claustrophobic.

## Elevation & Depth
In dark mode, traditional drop shadows are replaced by **Tonal Elevation** and **Luminous Outlines**.

- **Surface Tiers:** Depth is communicated by brightening the surface color. The higher an element sits, the lighter its gray hex value (from `surface-dim` to `surface-bright`).
- **Inner Glows:** Instead of outer shadows, elevated cards use a 1px inner border (opacity 10%) or a very subtle "bloom" effect (a 0%–5% opacity primary color glow) to define edges against the void.
- **Backdrop Blurs:** Modals and overlays use a heavy (32px) backdrop blur with a 60% opacity dark tint to maintain a sense of layered glass while keeping the focus on the foreground.

## Shapes
Shapes are generous and organic to counteract the "coldness" often associated with dark interfaces.

- **Container Radius:** Use `rounded-xl` (24px) for all primary content containers and image wrappers.
- **Interactive Radius:** Use `rounded-lg` (12px) for buttons and inputs.
- **Consistency:** All borders and strokes should maintain a consistent weight (1.5px) with rounded caps to mirror the softness of the container shapes.

## Components
Components are updated to prioritize "luminous" interactivity over physical depth.

- **Buttons:**
  - **Primary:** Filled with the desaturated Primary Green (#b0cdbb), featuring dark charcoal text for maximum contrast.
  - **Secondary:** Transparent background with a 1px border of `on-surface-tertiary`, shifting to `on-surface-primary` on hover.
- **Cards:** Cards should not have shadows. Instead, use a subtle 1px border (`#ffffff` at 8% opacity). On hover, increase the border opacity or add a faint glow using the `primary-color`.
- **Input Fields:** Fields are `surface-dim` with a bottom-only border or a very subtle ghost-outline. Focus states use a 1px stroke of the Ocean Blue accent.
- **Chips:** Small pill shapes using `surface-bright` backgrounds with `label-sm` text in the primary accent color.
- **Navigation Sidebar:** Uses a "vibrant line" active state—a 3px vertical glow in Primary Green next to the active menu item to guide the eye in the dark environment.