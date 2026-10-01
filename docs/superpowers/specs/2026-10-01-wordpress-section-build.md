# WordPress Section Build Design

## Goal

Extend the existing Gulp production build with portable WordPress component packages while preserving the current static `app/` build.

## Output

- `npm run build` creates both `app/` and `wordpress/`.
- `npm run build:wordpress` creates only `wordpress/`.
- `wordpress/common/` contains the required shared CSS, JavaScript, fonts, and other shared assets.
- `wordpress/sections/<name>/` contains formatted HTML variants plus only the CSS, JavaScript, and images used by that component.
- `wordpress/manifest.json` records component variants, asset paths, and the dependency on `common`.

## Component contract

- Every component is declared explicitly in `sections.config.js`.
- All existing visual partials are included; `head.html` is excluded.
- `hero`/`hero-main` and `call`/`call-about` are variants of one component package.
- `header`, `footer`, and `preloader` remain standalone components.
- Missing configured source files fail the build; intentionally absent CSS or JavaScript is represented by `null`.
- Stable filenames are used without content hashes.
- Section HTML remains readable and is not converted to PHP or ACF markup.
- Existing BEM selectors are preserved without automatic scoping.
- Section scripts are classic, self-starting Webpack bundles and depend on `common.js`.
- Shared third-party packages, utilities, and reusable initializers belong in `common.js`.
- Images are copied into each component package and HTML/CSS asset references are normalized.

## Verification

Automated tests cover configuration validation, manifest structure, grouped variants, missing optional assets, path normalization, and a real WordPress build smoke test.
