# About page design

## Goal

Implement `src/about.html` to match the approved Figma layouts for the company page while preserving the user's existing preloader, header, main reviews section, and footer. The page must remain content-flexible: longer copy may increase the height of sections and content containers without clipping or overlap.

## Design sources

- Figma file: `Платёжка Банк (Copy)` via `figma-bridge`
- File key: `unsaved-mulk9vj7-vanjc9gk`
- Desktop page frame: `2206:5465` (`1440px` wide)
- Mobile page frame: `2350:5205` (`375px` wide)
- Desktop section nodes:
  - about hero: `2279:3124`
  - location: `2279:3250`
  - reviews main: `2277:2584` (reference only; do not edit)
  - infrastructure: `2213:6796`
  - financial: `2282:3928`
  - employees: `2249:2723`
  - exhibitions: `2214:6994`
  - developing: `2233:2642`
  - call: `2227:1496`
- Mobile section nodes are the corresponding children of `2350:5205`; primary references include location `2350:5293`, employees `2350:5510`, exhibitions `2350:5681`, and developing `2351:7702`.

## Scope and ownership

The existing uncommitted `about.html`, section partials, SCSS files, and prepared image folders are the user's intended starting point. Modify them in place and preserve unrelated work.

Do not change:

- preloader
- header
- `reviews-main`
- footer
- the existing main form/card inside `call-about.html`, except for adjustments strictly required to place the two new lower cards without changing its content or behavior

Implement or complete:

- `about-hero`
- `location`
- `infrastructure`
- `financial`
- `employees`
- `exhibitions`
- `developing`
- the two lower `call` cards: “Свяжитесь с нами” and “Читайте нас в соцсетях”

## Markup and component structure

Keep the current include order in `src/about.html`. Each page section remains an isolated semantic partial with matching component SCSS. Use the smallest accurate HTML structure:

- one `h1` in `about-hero`
- an identified `h2` for each following thematic section
- native `button` elements for slider arrows and year navigation
- native `a` elements for external/contact destinations
- lists only where the content is meaningfully a list
- decorative images with `alt=""`; informative images with concise meaningful alternatives

The contact and social icons in the two new `call` cards use temporary `href="#"` destinations with explicit accessible labels. Missing WhatsApp and fifth social SVG assets may be exported from their exact Figma nodes through `figma-bridge` and stored under `src/img/call/`.

## Responsive layout

Desktop composition is fluid from `1440px` down to `1025px`. At `@include tablet` (`max-width: 1024px`), switch to the mobile composition represented by the `375px` Figma frame. No additional structural breakpoint is introduced unless visual verification proves it necessary to prevent overflow.

Do not apply fixed heights to text containers, composite content cards, or sections. Preserve dimensions or aspect ratios only for visual slots such as images, photo cards, map space, and slider viewports. Copy growth must expand the relevant container and section naturally.

## Section behavior

### About hero

Reproduce the desktop and mobile layouts, typography, overlays, cards, spacing, and background treatment from Figma. All copy comes from the design. Its content column may grow vertically if copy changes.

### Location

Reproduce the content and image slider. Provide an empty, correctly sized `<div data-location-map>` for the future map integration; do not render `src/img/location/map.png` or another placeholder image in it.

Use the shared horizontal slider. Desktop arrows appear when the DOM contains at least four slides. At the tablet breakpoint and below, hide arrows and retain touch/pointer drag and keyboard navigation.

### Infrastructure

Reproduce the heading, metrics, mapped visual, bubbles, spacing, and mobile reflow. Country flags may reuse matching files from `src/img/destinations/`.

### Financial

Reproduce the two-part desktop composition and the stacked mobile composition. Text growth expands its cards; visual media preserves its intended aspect ratio.

### Employees

Keep this section static on every breakpoint. It is not a slider and has no arrows. Reproduce the quote, attribution, partner marks, imagery, and responsive ordering from Figma.

### Exhibitions

Use the shared horizontal slider. The track must visibly extend beyond the right edge of the content container. Desktop arrows appear whenever the track is wider than its viewport. At the tablet breakpoint and below, hide arrows and retain swipe/drag. Preserve the text and document card next to the slider as shown in Figma.

### Developing

Use the shared horizontal slider for the seven timeline stages. The track must extend beyond the content container. Desktop arrows appear when there are at least seven slides; mobile arrows are hidden.

The year controls (`2012` through `2025`) are buttons that navigate to their corresponding stage. The active year stays synchronized after year clicks, arrow clicks, and drag completion. Keyboard operation and reduced-motion behavior must remain available.

### Call

Preserve the existing primary contact form/card. Append the two lower cards from Figma with their desktop two-column and mobile stacked layouts. Contact/social URLs remain `#` placeholders. Export only missing icon assets from Figma; reuse matching local assets where exact ones already exist.

## Shared slider changes

Extend the existing `horizontal-slider` implementation instead of introducing Swiper or another slider system. Preserve its existing public data-attribute API and current consumers. Add the minimum hooks required for:

- section-specific control thresholds
- controls hidden on tablet/mobile
- navigation to a specific slide from year buttons
- a slide-change notification or callback that keeps the active year in sync
- recalculation on resize
- pointer drag, arrow-key navigation, disabled arrow states, and `prefers-reduced-motion`

The extended helper must remain backward compatible with existing sliders on other pages.

## Visual and functional verification

Verify only the in-scope page sections and record pre-existing out-of-scope mismatches without altering them.

Required checks:

1. Run the production build and existing automated tests.
2. Run available HTML and style validation; distinguish pre-existing failures from regressions.
3. Compare rendered `about.html` against the Figma references at `1440px` and `375px`.
4. Check the responsive transition at `1025px` and `1024px`.
5. Temporarily exercise representative long headings and paragraphs to confirm natural height growth and no clipping, then restore approved copy.
6. Verify location controls at fewer than four and at least four slides.
7. Verify developing controls and synchronized year state for all seven stages.
8. Verify exhibitions overflow, desktop controls, and mobile swipe/drag.
9. Verify that `employees` remains static.
10. Verify all visible local assets exist, render non-empty, and occupy the intended design slots.
11. Confirm that preloader, header, reviews main, footer, and the existing primary call card were not functionally changed.

## Acceptance criteria

- The in-scope desktop and mobile sections match the referenced Figma layouts in typography, spacing, geometry, color, imagery, and responsive ordering.
- Longer copy expands sections without fixed-height clipping.
- Slider thresholds, overflow, mobile behavior, and timeline year synchronization match this specification.
- The map mount is empty and ready for later integration.
- HTML remains semantic and accessible.
- Existing out-of-scope blocks and slider consumers remain intact.
