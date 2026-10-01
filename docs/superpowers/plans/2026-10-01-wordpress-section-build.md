# WordPress Section Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-ready per-component WordPress artifact build without breaking the existing static build.

**Architecture:** A declarative `sections.config.js` describes component HTML variants, styles, scripts, and image globs. Focused CommonJS build helpers validate the configuration, compile shared and sectional assets, rewrite local asset paths, and emit a deterministic manifest; Gulp exposes those helpers as `build:wordpress` and composes them into `build`.

**Tech Stack:** Gulp 4, Webpack 5, Babel, Dart Sass, PostCSS/Autoprefixer, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-01-wordpress-section-build.md`

## Global Constraints

- Preserve all current uncommitted user changes.
- Keep stable output filenames and classic scripts.
- Keep section HTML formatted and selectors unscoped.
- Fail on missing configured sources; use `null` only for intentionally absent optional CSS/JS.
- Do not replace or remove the existing `app/` production output.

## Review Focus

- Windows and POSIX path separators must both become forward slashes in the manifest.
- HTML asset URLs beginning with either `img/` or `../img/` must resolve to the intended source file.
- Shared images used by several sections must remain portable in every corresponding package.
- Variant components must emit one CSS/JS pair without silently dropping either HTML file.
- A component with no JS must omit the file and expose `js: null`.

---

### Task 1: Configuration model and validation

**Files:**
- Create: `sections.config.js`
- Create: `build/wordpress-build.js`
- Create: `tests/wordpress-build.test.cjs`

**Interfaces:**
- Produces: `validateConfig(config, rootDir)` and normalized component descriptors used by later build stages.

- [ ] Write tests for unique names, existing configured files, grouped variants, and explicit null assets.
- [ ] Run `node --test tests/wordpress-build.test.cjs` and verify the missing API fails.
- [ ] Implement the configuration and validation API.
- [ ] Re-run the focused tests and verify they pass.

### Task 2: HTML, CSS, images, and manifest

**Files:**
- Modify: `build/wordpress-build.js`
- Modify: `tests/wordpress-build.test.cjs`

**Interfaces:**
- Consumes: validated component descriptors from Task 1.
- Produces: `buildWordPressAssets(options)` and a deterministic `manifest.json`.

- [ ] Write failing tests for formatted HTML copying, asset URL normalization, absent optional files, and manifest paths.
- [ ] Run the focused tests and confirm the expected failures.
- [ ] Implement common/section Sass compilation, image copying, URL rewriting, and manifest emission.
- [ ] Re-run focused tests and verify they pass.

### Task 3: Multi-entry JavaScript and Gulp integration

**Files:**
- Create: `src/js/wordpress-common.js`
- Modify: `build/wordpress-build.js`
- Modify: `gulpfile.js`
- Modify: `package.json`
- Modify: `tests/wordpress-build.test.cjs`

**Interfaces:**
- Consumes: the section script arrays declared in `sections.config.js`.
- Produces: classic `common/common.js` and optional `sections/<name>/<name>.js` bundles plus Gulp tasks `wordpress` and `build`.

- [ ] Write failing tests for Webpack entries and package scripts.
- [ ] Run the focused tests and confirm the expected failures.
- [ ] Implement Webpack dependency entries and Gulp task composition.
- [ ] Run the focused tests and then the full existing test suite.

### Task 4: Documentation and end-to-end verification

**Files:**
- Modify: `README.md`
- Modify: `tests/wordpress-build.test.cjs`

**Interfaces:**
- Consumes: completed WordPress build command and manifest.
- Produces: documented integration workflow and smoke-test coverage.

- [ ] Add a failing smoke assertion for representative `hero`, grouped variants, and a CSS-only component.
- [ ] Run `npm run build:wordpress` and correct only implementation defects exposed by the smoke test.
- [ ] Document the output layout, config extension workflow, and WordPress enqueue order.
- [ ] Run `npm test`, `npm run build:wordpress`, and `npm run build`; inspect exit codes and generated manifest before completion.
