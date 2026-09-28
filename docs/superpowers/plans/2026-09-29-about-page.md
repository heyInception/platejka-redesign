# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the responsive `about.html` page sections to match the approved desktop and mobile Figma frames without altering the already completed global blocks.

**Architecture:** Keep every page section in its existing partial and matching SCSS component. Reuse and minimally extend the shared GSAP horizontal slider for location, exhibitions, and developing; keep employees static and append only the two missing cards to the existing call block.

**Tech Stack:** Gulp file includes, semantic HTML, SCSS, vanilla JavaScript, GSAP, Node.js `node:test`, Cheerio, Sass.

**Spec:** `docs/superpowers/specs/2026-09-29-about-page-design.md`

## Global Constraints

- Use `figma-bridge` file `unsaved-mulk9vj7-vanjc9gk`; desktop frame `2206:5465` and mobile frame `2350:5205` are the visual sources of truth.
- Do not edit preloader, header, `reviews-main`, footer, or the content and behavior of the existing primary call form/card.
- Preserve all unrelated user changes in the dirty worktree and modify the prepared about-page files in place.
- Desktop is fluid from `1440px` through `1025px`; mobile composition starts at `@include tablet` (`max-width: 1024px`).
- Text and composite content containers must grow naturally; fixed dimensions or `aspect-ratio` are allowed only for visual slots.
- Reuse local assets when they match exactly; export only missing call icons from Figma into `src/img/call/`.
- Sliders keep native overflow as a no-JavaScript fallback, support keyboard and pointer drag, and honor `prefers-reduced-motion`.

## Review Focus

- Long headings and paragraphs must increase section height without clipping or overlapping visual slots; covered by compiled-CSS assertions in Tasks 2–8 and manual long-copy verification in Task 9.
- A slider with fewer than its configured minimum must hide desktop controls while existing sliders retain their legacy mobile behavior unless they opt into desktop-only controls; covered in Task 1.
- Timeline year buttons must remain synchronized after direct selection, arrows, drag completion, and resize clamping; covered in Tasks 1 and 7.
- At the `1025px`/`1024px` boundary, layouts must switch once without accidental horizontal page overflow; covered in each section test and Task 9.
- Missing or empty static assets must be caught before delivery, especially exported call icons and prepared section imagery; covered in Tasks 2–8 and the asset audit in Task 9.

---

### Task 1: Extend the shared horizontal slider contract

**Files:**
- Modify: `src/js/components/horizontal-slider.cjs`
- Modify: `src/js/components/horizontal-slider.js`
- Modify: `tests/horizontal-slider.test.cjs`

**Interfaces:**
- Consumes: existing `data-horizontal-slider`, viewport, track, slide, previous, next, controls, and `data-horizontal-slider-min-controls` hooks.
- Produces: optional `data-horizontal-slider-desktop-controls`; optional controls with `data-horizontal-slider-go-to="<zero-based-index>"`; `horizontal-slider:change` event with `detail: { index }`; returned `goTo(index, immediate)` and `refresh()` methods remain backward compatible.

- [ ] **Step 1: Add failing helper tests for desktop-only controls**

Extend the `shouldShowControls` assertions to cover a fourth `desktopOnly` argument: opted-in mobile controls return `false`, legacy mobile controls retain the current result, and desktop count thresholds remain exact at 4 and 7.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/horizontal-slider.test.cjs`
Expected: FAIL because `shouldShowControls` does not implement the opt-in desktop-only rule.

- [ ] **Step 3: Implement the pure control rule**

Update `shouldShowControls(slideCount, minimum, isDesktop, desktopOnly = false) -> boolean` without changing the results of existing three-argument callers.

- [ ] **Step 4: Run the focused test and verify success**

Run: `node --test tests/horizontal-slider.test.cjs`
Expected: PASS.

- [ ] **Step 5: Wire indexed controls and change notifications**

In `initHorizontalSlider(root)`, parse `data-horizontal-slider-desktop-controls`, query indexed controls, call `goTo()` on their clicks, update `aria-current`, and dispatch `horizontal-slider:change` after the reachable index is settled. Ensure `refresh()` also resynchronizes indexed controls after resize clamping.

- [ ] **Step 6: Run the full slider regression tests**

Run: `node --test tests/horizontal-slider.test.cjs tests/index-slider-sections.test.cjs tests/review-main.test.cjs`
Expected: PASS with existing review/index sliders unchanged.

- [ ] **Step 7: Commit the slider contract**

```bash
git add src/js/components/horizontal-slider.cjs src/js/components/horizontal-slider.js tests/horizontal-slider.test.cjs
git commit -m "feat: extend shared slider navigation"
```

### Task 2: Complete page composition and about hero

**Files:**
- Modify: `src/about.html`
- Modify: `src/partials/about-hero.html`
- Modify: `src/scss/components/_about-hero.scss`
- Modify: `src/scss/main.scss` only if an existing required import is missing or duplicated
- Create: `tests/about-page.test.cjs`

**Interfaces:**
- Consumes: existing page includes, design tokens, prepared assets in `src/img/about-hero/`.
- Produces: one page `h1`, Figma-matched hero content and cards, and a stable ordered include contract for later tasks.

- [ ] **Step 1: Write failing page and hero structure tests**

Use Cheerio to assert the exact include order, one `h1` in the hero partial, semantic labelled section markup, required prepared asset references, and absence of fixed-height declarations on hero text/content wrappers. Compile `src/scss/main.scss` and assert desktop `1440px` geometry plus the `@media (max-width: 1024px)` mobile composition.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/about-page.test.cjs`
Expected: FAIL because the hero partial and SCSS are incomplete.

- [ ] **Step 3: Implement the semantic hero markup**

Translate Figma node `2279:3124` and its mobile counterpart into the prepared partial. Preserve exact approved copy, card order, image placement, accessible image alternatives, and native links/buttons.

- [ ] **Step 4: Implement responsive hero styles**

Match typography, colors, background/overlay, spacing, radii, desktop columns, and mobile stacking. Replace Figma fixed content heights with content-driven sizing while keeping image/card visual ratios.

- [ ] **Step 5: Run the focused test and build**

Run: `node --test tests/about-page.test.cjs`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0 and `app/about.html` generated.

- [ ] **Step 6: Commit the page shell and hero**

```bash
git add src/about.html src/partials/about-hero.html src/scss/components/_about-hero.scss src/scss/main.scss tests/about-page.test.cjs
git commit -m "feat: build about page hero"
```

### Task 3: Implement the location section

**Files:**
- Modify: `src/partials/location.html`
- Modify: `src/scss/components/_location.scss`
- Create: `tests/location-section.test.cjs`

**Interfaces:**
- Consumes: shared slider contract from Task 1 and prepared images in `src/img/location/`.
- Produces: empty `[data-location-map]`, a three-image design track that supports additional slides, and desktop controls gated by `data-horizontal-slider-min-controls="4"`.

- [ ] **Step 1: Write failing semantic and slider tests**

Assert a labelled section with `h2`, an empty `[data-location-map]` with no `<img>` descendant or CSS background image, slider viewport/track/slide hooks, desktop-only controls, threshold `4`, native-scrolling fallback, and mobile controls hidden at `max-width: 1024px`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/location-section.test.cjs`
Expected: FAIL against the empty prepared partial and SCSS.

- [ ] **Step 3: Implement location markup from Figma**

Translate desktop node `2279:3250` and mobile node `2350:5293`, including exact copy, CTA/contact details, empty map mount, prepared image slides, and labelled arrow buttons.

- [ ] **Step 4: Implement responsive location styles**

Match the `688px/592px` desktop composition, map radius, slide sizes/gaps, section padding, and mobile ordering. Use content-driven heights for copy and `aspect-ratio` for map/image slots.

- [ ] **Step 5: Run tests and compile SCSS**

Run: `node --test tests/location-section.test.cjs tests/horizontal-slider.test.cjs`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 6: Commit location**

```bash
git add src/partials/location.html src/scss/components/_location.scss tests/location-section.test.cjs
git commit -m "feat: add about location section"
```

### Task 4: Implement infrastructure and financial sections

**Files:**
- Modify: `src/partials/infrastructure.html`
- Modify: `src/scss/components/_infrastructure.scss`
- Modify: `src/partials/financial.html`
- Modify: `src/scss/components/_financial.scss`
- Create: `tests/about-business-sections.test.cjs`

**Interfaces:**
- Consumes: design tokens, prepared infrastructure/financial images, exact matching flags from `src/img/destinations/`.
- Produces: independent labelled infrastructure and financial sections with content-driven text/card sizing.

- [ ] **Step 1: Write failing section tests**

Assert semantic headings, Figma copy anchors, exact count/order of metric cards and financial content cards, valid local asset references, matching destination flag paths, no fixed height on text/card containers, and tablet reordering rules.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/about-business-sections.test.cjs`
Expected: FAIL because both prepared sections are empty.

- [ ] **Step 3: Implement infrastructure markup and styles**

Translate node `2213:6796`: centered heading/content, three metric cards, mapped visual, flag bubbles, desktop placement, and mobile reflow. Treat decorative map/bubbles appropriately for accessibility.

- [ ] **Step 4: Run the focused test and confirm only financial assertions still fail**

Run: `node --test tests/about-business-sections.test.cjs`
Expected: infrastructure assertions PASS; financial assertions FAIL.

- [ ] **Step 5: Implement financial markup and styles**

Translate node `2282:3928` and the matching mobile section, including the main two-column content, supporting card, prepared illustrations, and copy-flexible sizing.

- [ ] **Step 6: Run tests and build**

Run: `node --test tests/about-business-sections.test.cjs`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 7: Commit both related business sections**

```bash
git add src/partials/infrastructure.html src/scss/components/_infrastructure.scss src/partials/financial.html src/scss/components/_financial.scss tests/about-business-sections.test.cjs
git commit -m "feat: add about business sections"
```

### Task 5: Implement the static employees section

**Files:**
- Modify: `src/partials/employees.html`
- Modify: `src/scss/components/_employees.scss`
- Create: `tests/employees-section.test.cjs`

**Interfaces:**
- Consumes: prepared employee images and logos in `src/img/employees/`.
- Produces: a static quote/profile section with no horizontal slider hooks or arrow controls.

- [ ] **Step 1: Write failing static-section tests**

Assert labelled section markup, exact quote/attribution anchors, required assets, zero slider data attributes, zero arrow buttons, content-driven text wrappers, desktop two-column layout, and mobile text-before-photo order.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/employees-section.test.cjs`
Expected: FAIL because the prepared section is empty.

- [ ] **Step 3: Implement employees markup and styles**

Translate desktop node `2249:2723` and mobile node `2350:5510`, keeping the section static and preserving quote, attribution, brand marks, background, and photo geometry.

- [ ] **Step 4: Run test and build**

Run: `node --test tests/employees-section.test.cjs`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 5: Commit employees**

```bash
git add src/partials/employees.html src/scss/components/_employees.scss tests/employees-section.test.cjs
git commit -m "feat: add about employees section"
```

### Task 6: Implement the exhibitions overflow slider

**Files:**
- Modify: `src/partials/exhibitions.html`
- Modify: `src/scss/components/_exhibitions.scss`
- Create: `tests/exhibitions-section.test.cjs`

**Interfaces:**
- Consumes: Task 1 slider contract and prepared files in `src/img/exhibitions/`.
- Produces: four exhibition slides, a document card, desktop overflow-aware controls, and mobile swipe/drag without visible arrows.

- [ ] **Step 1: Write failing slider and overflow tests**

Assert exact four-slide count, shared slider hooks, desktop-only controls, semantic heading/document link, exact local assets, native overflow fallback, right-edge escape using a viewport-width calculation, and tablet arrow hiding.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/exhibitions-section.test.cjs`
Expected: FAIL against the empty prepared files.

- [ ] **Step 3: Implement exhibitions markup and styles**

Translate desktop node `2214:6994` and mobile node `2350:5681`, including exact copy, document card, four images, desktop controls, track geometry, and mobile sizes. Ensure the section grows when copy expands.

- [ ] **Step 4: Run test and build**

Run: `node --test tests/exhibitions-section.test.cjs tests/horizontal-slider.test.cjs`
Expected: PASS.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 5: Commit exhibitions**

```bash
git add src/partials/exhibitions.html src/scss/components/_exhibitions.scss tests/exhibitions-section.test.cjs
git commit -m "feat: add exhibitions slider"
```

### Task 7: Implement the synchronized developing timeline

**Files:**
- Modify: `src/partials/developing.html`
- Modify: `src/scss/components/_developing.scss`
- Create: `tests/developing-section.test.cjs`

**Interfaces:**
- Consumes: Task 1 indexed slider controls and prepared seven images in `src/img/developing/`.
- Produces: seven stage slides, year buttons using `data-horizontal-slider-go-to="0"` through `"6"`, threshold `7`, and synchronized `aria-current` state.

- [ ] **Step 1: Write failing timeline tests**

Assert seven slides, the ordered year labels `2012, 2014, 2018, 2019, 2020, 2024, 2025`, zero-based indexed controls, only the first button initially `aria-current="true"`, desktop-only controls, threshold `7`, exact seven image paths, right-edge escape, and mobile hidden arrows.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/developing-section.test.cjs`
Expected: FAIL against the empty prepared files.

- [ ] **Step 3: Implement timeline markup**

Translate desktop node `2233:2642` and mobile node `2351:7702`, using buttons for years and arrows, accessible slider region markup, and exact stage copy/image order.

- [ ] **Step 4: Implement responsive timeline styles**

Match paired text/image desktop cards, mobile stacked cards, tag row overflow, controls, section padding, and Figma radii. Use content-driven card height and visual aspect ratios rather than clipping copy.

- [ ] **Step 5: Run timeline and slider tests**

Run: `node --test tests/developing-section.test.cjs tests/horizontal-slider.test.cjs`
Expected: PASS, including active-year contract and legacy slider assertions.

- [ ] **Step 6: Commit developing**

```bash
git add src/partials/developing.html src/scss/components/_developing.scss tests/developing-section.test.cjs
git commit -m "feat: add developing timeline slider"
```

### Task 8: Add the two lower call cards and exact icons

**Files:**
- Modify: `src/partials/call-about.html`
- Modify: `src/scss/components/_call.scss`
- Create: `src/img/call/whatsapp.svg`
- Create: `tests/call-about-section.test.cjs`

**Interfaces:**
- Consumes: untouched primary call form/card; reusable Telegram, VK, VC.ru, RBC, and Lenta assets from `src/img/about-hero/`; exact missing WhatsApp vector exported through `figma-bridge`.
- Produces: two lower cards with two contact links and five social links, all temporary `href="#"` and explicitly labelled.

- [ ] **Step 1: Identify and export the missing exact WhatsApp SVG node**

Use `figma-bridge` on call node `2227:1496` to resolve the WhatsApp node, then save that exact SVG as `src/img/call/whatsapp.svg`. Verify it is non-empty and has intrinsic `width`, `height`, and `viewBox`. Confirm the five social icons match `telegram.svg`, `vk.svg`, `vc-ru.svg`, `rbc.svg`, and `lenta.svg` already present under `src/img/about-hero/`.

- [ ] **Step 2: Write failing call-about tests**

Snapshot the primary card/form structure and assert it remains present with the same controls. Add assertions for two lower cards, their headings/copy, exactly two contact anchors, exactly five social anchors, `href="#"`, non-empty accessible labels, and all icon paths existing on disk.

- [ ] **Step 3: Run the focused test and verify failure**

Run: `node --test tests/call-about-section.test.cjs`
Expected: FAIL because the two lower cards are absent.

- [ ] **Step 4: Append semantic lower-card markup**

Add only the two Figma cards after the primary card. Reuse exact existing local icons and the two exported assets; do not change the form fields, consent control, trust cards, or call initialization hooks.

- [ ] **Step 5: Add scoped lower-card styles**

Match desktop `648px + 648px` cards, spacing, typography, icon buttons, and mobile stacked `359px` cards. Keep styles under call-about-specific descendant classes so other pages using `call.html` retain their current layout.

- [ ] **Step 6: Run call regressions and build**

Run: `node --test tests/call-about-section.test.cjs tests/call-section.test.cjs`
Expected: PASS with the original reusable call tests unchanged.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 7: Commit the lower call cards**

```bash
git add src/partials/call-about.html src/scss/components/_call.scss src/img/call tests/call-about-section.test.cjs
git commit -m "feat: add about contact cards"
```

### Task 9: Integrate, validate, and visually compare the complete page

**Files:**
- Modify: only in-scope files from Tasks 1–8 when verification exposes a mismatch
- Test: all files under `tests/`

**Interfaces:**
- Consumes: the complete about page and Figma reference frames.
- Produces: verified desktop/mobile output with a documented clean regression result for the requested scope.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 2: Run production build and source checks**

Run: `npm run build`
Expected: exit code 0 and generated `app/about.html` plus referenced assets.

Run: `npm run code`
Expected: exit code 0, or record only pre-existing formatting failures with evidence.

- [ ] **Step 3: Run HTML validation**

Run: `npm run html`
Expected: exit code 0, or record validator/network limitations and distinguish pre-existing output from page regressions.

- [ ] **Step 4: Audit all about-page asset references**

Check every `../img/...` reference from the seven new partials and `call-about.html`; assert the local file exists and has non-zero size. Confirm no temporary Figma URLs or exported full-frame screenshots are used in source.

- [ ] **Step 5: Capture and compare desktop rendering**

Run the local Gulp preview, render `about.html` at `1440px`, and compare each in-scope section against Figma desktop nodes. Correct typography, spacing, radii, color, image crop, overflow, and control visibility without changing out-of-scope blocks.

- [ ] **Step 6: Capture and compare mobile rendering**

Render at `375px` and compare to mobile frame `2350:5205`. Confirm stacked order, 8/16px edge offsets from the design, hidden slider arrows, touch-width tracks, and no page-level horizontal overflow.

- [ ] **Step 7: Verify the responsive boundary**

Render at `1025px` and `1024px`. Confirm exactly one composition switch, no clipped copy, no overlap, and no accidental fixed-height constraint.

- [ ] **Step 8: Exercise long copy and interactive states**

Temporarily lengthen representative hero, location, financial, employees, exhibitions, and developing copy in browser devtools. Confirm natural growth, then verify location thresholds, exhibition overflow, seven developing stages, year synchronization, pointer drag, keyboard arrows, and reduced-motion mode.

- [ ] **Step 9: Inspect the final scoped diff**

Run: `git diff --check`
Expected: no whitespace errors.

Run: `git status --short`
Expected: only intentional about-page changes remain; user-owned unrelated changes are preserved.

- [ ] **Step 10: Commit verification fixes**

Stage each adjusted in-scope file explicitly, then run `git commit -m "fix: align about page with design"`.

Skip this commit when verification required no file changes.
