# BOM Manager Enhancements Plan

## Goal
Implement the full set of requested enhancements: image grid fix with clipboard paste, robust JSON import/export with strict validation, section‑asset handling, cross‑project section copy, and stock‑movement tracking.

## Tasks
- [ ] **Task 1: UI Grid Image Fix & Clipboard Paste**
  - Update `FileUpload` to support clipboard paste (already done) and ensure the grid component displays the uploaded image via a signed URL after successful upload.
  - Verify with hover‑based edit button on grid cards.
  - **Verify:** Run dev server, upload via paste, confirm image appears in grid.

- [ ] **Task 2: JSON Import/Export API with Validation**
  - Design import schema (`projectName`, `sectionName`, `price`, `priceDate`, optional assets).
  - Implement validation: abort entire import if any `projectName`/`sectionName` is missing or miss‑spelled; fail whole import on duplicate part (name/number/ERP) case‑insensitive.
  - Add export endpoints for CSV and JSON matching import format.
  - **Verify:** Import a sample file with intentional errors; ensure process aborts and returns error report.

- [ ] **Task 3: Section Asset Support**
  - Extend `project_sections` table with `image_path`, `drawing_path`, `datasheet_path` columns.
  - Update `SectionModal` UI to include `FileUpload` fields for each asset.
  - Ensure assets are stored in a dedicated bucket (`section-assets`).
  - **Verify:** Add assets to a section, reload page, assets display correctly.

- [ ] **Task 4: Section Copy Between Projects**
  - Create `CopySectionModal` UI to select source project/section and target project.
  - API endpoint to duplicate section data and associated assets, preserving price history.
  - **Verify:** Copy a section, edit its price in the new project, and confirm original remains unchanged.

- [ ] **Task 5: Stock‑Movement Tracking**
  - Confirm existing `stock_movements` table schema; if missing columns, add `part_id`, `quantity`, `movement_type`, `timestamp`, `note`.
  - Build UI for manual Stock In/Out entries (single modal with toggle).
  - API routes for creating and querying stock movements.
  - **Verify:** Record a stock‑in and stock‑out, ensure balances update correctly.

- [ ] **Task 6: Testing**
  - Write unit and integration tests for each new API endpoint.
  - Add UI tests (Playwright) for grid image display, import abort behavior, section copy flow, and stock movement UI.
  - **Verify:** All test suites pass (`npm test`).

- [ ] **Task 7: Lint, Security, and Performance Checks**
  - Run `lint_runner.py`, `security_scan.py`, and `lighthouse_audit.py`.
  - Fix any reported issues.
  
## Done When
- All tasks are marked completed.
- All verification steps pass.
- No lint or security warnings remain.
- Application builds and runs without runtime errors.
