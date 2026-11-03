# Task Checklist: Batch Downloads

- [x] Task 1: Install `jszip` dependency
  - Acceptance: `jszip` in `dependencies` of `package.json`.
  - Verify: `npm run build` works.
  - Files: `package.json`

- [x] Task 2: Create batch export helper (`src/lib/qr-batch-export.js`)
  - Acceptance: Exports `downloadBatchAsZip(items, format, onProgress)`. Handles PNG blobs and SVG strings.
  - Verify: Successfully bundles files and triggers download.
  - Files: `src/lib/qr-batch-export.js`

- [x] Task 3: Add selection and batch download bar to `SavedCodesModal.jsx`
  - Acceptance: Select individual or Select All, choose PNG or SVG, see progress counter, and download ZIP.
  - Verify: Build clean, UI renders without console errors.
  - Files: `src/components/SavedCodesModal.jsx`
