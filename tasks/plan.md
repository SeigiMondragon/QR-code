# Implementation Plan: Batch Downloads for QR Codes

## Overview
Add multi-select capabilities and batch ZIP export (PNG and SVG) to the Saved QR Codes library using `jszip`.

## Architecture & Data Flow
1. **Selection Layer**:
   - `selectedIds` state (Set / Array) in `SavedCodesModal.jsx`.
   - "Select All" / "Deselect All" button.
   - Checkbox on each saved code card.
2. **Export Engine (`src/lib/qr-batch-export.js`)**:
   - Accepts list of items, format (`'png'` or `'svg'`), and onProgress callback.
   - Renders each QR configuration to PNG Blob / SVG string using `toDataURL` or `toSVGString`.
   - Adds each file to `new JSZip()`.
   - Generates `.zip` blob and triggers browser download.
3. **UI Integration**:
   - Sticky / Floating Batch Toolbar in `SavedCodesModal.jsx` showing selection count, format dropdown (PNG / SVG), and "Download ZIP" button with progress spinner.

## Verification Checkpoints
- [ ] `jszip` installed and builds cleanly: `npm run build`
- [ ] Select single, multiple, or all QR codes
- [ ] ZIP archive downloads with correct files and readable images
