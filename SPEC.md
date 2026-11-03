# Spec: Save & Edit QR Codes with Cloudinary, Firebase Firestore & Batch Download

## Objective
Enable users to save generated QR codes and their configurations (including custom logos) so they can reload, view, and edit them later. Custom logo images and QR preview images are uploaded to Cloudinary unsigned upload preset, and the resulting URLs and design parameters are persisted in Firebase Firestore.
Additionally, support **Batch Downloads** allowing users to select multiple or all saved QR codes and download them packaged in a single `.zip` archive as PNG or SVG files.

---

## Tech Stack
- Frontend: React 19, Vite 8, Tailwind CSS v4, Lucide React
- Storage / Media: Cloudinary (Cloud name: `dxao3dleg`, Upload preset: `sample`)
- Database: Firebase Firestore (`firebase/firestore`, project: `qrcode-24eef`)
- Archive / Packaging: `jszip` (client-side ZIP packaging)
- Rendering: `@kroszborg/rune`, `@kroszborg/rune-react`

---

## Commands
```bash
# Install jszip for batch archive export
npm install jszip

# Development server
npm run dev

# Production build
npm run build

# Code linting
npm run lint
```

---

## Project Structure
```text
src/
├── lib/
│   ├── cloudinary.js    # Cloudinary upload helpers (logo & QR preview)
│   ├── firebase.js        # Firebase initialization & Firestore instance
│   ├── qr-storage.js     # Firestore CRUD (create, read, update, delete QR designs)
│   ├── qr-batch-export.js # Batch zip export generator (PNG/SVG) using JSZip
│   └── qr-export.js      # Single exports and Rune options builder
├── components/
│   ├── Header.jsx        # Header with "Saved QR Codes" trigger button
│   ├── PreviewCard.jsx   # Live preview and single exports + save trigger
│   ├── SavedCodesModal.jsx # Saved library with multi-select & batch download bar
│   └── SaveQRModal.jsx   # Name and save dialog
```

---

## Batch Download Workflow
1. User opens "Saved Codes" modal.
2. User can toggle selection checkboxes or click "Select All" (`n` selected).
3. A Batch Action Bar appears with options:
   - Export Format: **PNG** (1024px) or **SVG** (Vector)
   - Action: **Download Selected as ZIP**
4. The generator loops through selected items, renders their respective Rune options into PNG data URLs or SVG markup strings, packages them into a ZIP archive, and triggers a direct browser download (`qr-codes-batch.zip`).
5. Progress indicator displays current progress (e.g., "Exporting 3 of 8...").

---

## Boundaries
- **Always**: Sanitize filenames inside the ZIP (replace invalid filesystem characters with dashes); show progress during zip compilation.
- **Ask First**: Adding external packages other than `jszip`.
- **Never**: Block UI responsiveness during batch rendering.

---

## Success Criteria
1. Multi-select checkboxes available on all saved QR cards with "Select All" toggle.
2. User can choose export format (PNG or SVG).
3. Single click triggers generation of `.zip` containing properly formatted QR files named after their title/ID.
4. Preserves logos and visual styling in each exported batch item.
