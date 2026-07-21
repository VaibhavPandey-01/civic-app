---
name: Ocean Preventions
colors:
  surface: '#f9f9ff'
  surface-dim: '#cadaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d7e2ff'
  on-surface: '#041b3c'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3052'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#82f9be'
  on-secondary-container: '#00734c'
  tertiary: '#851800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b02300'
  on-tertiary-container: '#ffc6b9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#82f9be'
  secondary-fixed-dim: '#65dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8b1a00'
  background: '#f9f9ff'
  on-background: '#041b3c'
  surface-variant: '#d7e2ff'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for **Ocean Preventions**, a platform balancing the high-stakes urgency of emergency response with the long-term stewardship of maritime environments. The target audience spans from coastal residents and fishers to government officials, requiring a UI that is universally legible and cognitively light.

The style is **Corporate Modern with a Humanitarian lean**. It prioritizes clarity and functional efficiency over decorative elements. By utilizing expansive whitespace and a structured grid, the system evokes a sense of calm authority. The interface remains approachable through soft geometries, ensuring that users in high-stress situations feel guided rather than overwhelmed.

## Colors

The color palette is rooted in trust and environmental vitality. 

- **Primary (Deep Sea Blue):** Used for primary actions, navigation headers, and authoritative UI elements. It establishes professional credibility.
- **Secondary (Coastal Green):** Reserved for environmental reporting, success states, and growth-related metrics.
- **Emergency (Alert Red):** A high-visibility accent used exclusively for SOS triggers, critical hazard warnings, and immediate life-safety alerts.
- **Surface & Background:** A hierarchy of whites and cool grays ensures depth without introducing visual noise. 

All color pairings must meet WCAG 2.1 AA standards for contrast to ensure accessibility for elderly users and those with visual impairments.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility in digital interfaces. The typographic scale is generous, favoring larger body sizes to ensure readability in outdoor or high-glare maritime environments.

- **Headlines:** Use Semi-Bold (600) for clear hierarchy. Tighten letter spacing slightly on larger displays to maintain visual cohesion.
- **Body Copy:** Standardize on 18px for primary content to maximize accessibility. Use a line height of 1.5x - 1.6x the font size to prevent text crowding.
- **Labels:** Use Medium (500) or Semi-Bold (600) weights in all-caps or sentence case for metadata and navigation items.

## Layout & Spacing

The layout follows a **fluid-to-fixed grid** model. On mobile devices, a single-column layout is preferred with a minimum 20px side margin to prevent accidental touch-triggering near the screen edges.

- **Grid:** 4-column for mobile, 8-column for tablet, 12-column for desktop.
- **Spacing Rhythm:** Based on an 8px base unit. Component internal padding should default to 16px (md) or 24px (lg) for touch targets.
- **Safe Areas:** Ensure interactive elements are kept clear of device notches and bottom home indicators.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

1. **Level 0 (Base):** Background (#FFFFFF).
2. **Level 1 (Cards/Inputs):** Surface Subtle (#F4F5F7) or White with a 1px border (#DFE1E6). No shadow.
3. **Level 2 (Active State):** White background with a soft, diffused shadow (Offset 0, 4px; Blur 12px; Color: Neutral 10% opacity). Used for interactive cards.
4. **Level 3 (Modals/Overlays):** Elevated surface with a pronounced shadow (Offset 0, 12px; Blur 24px; Color: Neutral 15% opacity).

Avoid pure black shadows; always tint shadows with a hint of the Primary Blue to maintain the "ocean" aesthetic.

## Shapes

The shape language is **Pill-shaped and hyper-rounded**. This maximizes the "Friendly & Approachable" brand pillar.

- **Primary Buttons:** 32px radius (full pill) to invite interaction.
- **Cards:** 16px to 24px corner radius.
- **Input Fields:** 12px radius to balance between the button pill-shape and structured data entry.
- **Selection Indicators:** Use circular (radio) or heavily rounded (checkbox) forms.

## Components

- **Buttons:** Large touch targets (minimum height 56px). Primary buttons use a solid blue fill with white text. Emergency "SOS" buttons use a pulse animation and red fill.
- **Cards:** Use a white background, 1px subtle border, and a Level 2 shadow. Content should be padded with 20px internally.
- **Input Fields:** Outlined style with a 1px border. Labels must always be visible (not floating) to ensure clarity during data entry. Active states use a 2px Primary Blue border.
- **Chips:** Highly rounded (pill) tags used for categories (e.g., "Pollution," "Hazard," "Wildlife"). Backgrounds should be low-saturation tints of the status colors.
- **Lists:** Clean rows with 16px vertical padding. Use thin icons (2pt stroke) for trailing/leading indicators to maintain a lightweight feel.
- **Emergency Toggle:** A specialized component for immediate reporting, requiring a "hold-to-confirm" or "slide-to-report" interaction to prevent accidental triggers.