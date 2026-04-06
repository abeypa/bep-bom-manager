# Project Plan: Main Sections and Subsections

## 1. Context & Objectives
**Goal:** Enhance the project structure to support a two-level hierarchy: Main Sections containing multiple Subsections, where Subsections hold the actual mapped parts.
**Currently:** Projects contain Sections containing Parts.
**Future:** Projects contain Main Sections containing Subsections containing Parts.

## 2. Structural & Database Architecture
To support this hierarchy cleanly at the database level, we have two primary schema approaches:

### Proposed Schema Strategy (Option A - Dedicated Tables)
- Create `project_main_sections` table:
  - `id` (uuid/int)
  - `project_id` (fkey -> projects)
  - `name` (string)
  - `order_index` (int)
- Alter `project_sections` table (these become the "Subsections"):
  - Add `main_section_id` (fkey -> project_main_sections)

### Proposed Schema Strategy (Option B - Self-Referencing / Parent ID)
- Alter `project_sections` table:
  - Add `parent_id` (fkey -> project_sections.id, nullable). 
  - If `parent_id` is null, it's a Main Section. If it has a `parent_id`, it's a Subsection.

*(Recommendation: Option B requires fewer API changes but Option A provides stricter typing and easier referential integrity. We will confirm with the user).*

## 3. UI/UX Changes Required

### ProjectDetails.tsx
- **Current Layout:** Renders a flat list of `project_sections` as expanded blocks.
- **New Layout:** 
  - Level 1: Main Section headings (potentially foldable accordions or large segmented dividers).
  - Level 2: Subsections within each Main Section block.
  - Level 3: Part list table.

### Modals
1. **Add Section Modal:**
   - Needs a toggle or dropdown to specify if this is a new "Main Section" or a "Subsection" belonging to an existing Main Section.
2. **Add Part Modal:**
   - Instead of a flat list of sections, the dropdown must show `Main Section -> Subsection`.

### BOM Export (`export.ts`)
- Group exports by Main Section first, then by Subsection.

## 4. Implementation Phases

**Phase 1: Database Migration (Supabase)**
- Update SQL schema to support the hierarchy (Main Section vs Subsection).
- Write a migration script to wrap existing `project_sections` into a default "General" Main Section so data isn't orphaned.

**Phase 2: API & Types (`src/api/projects.ts` & `src/types/database.ts`)**
- Update types to reflect the nested relational structure.
- Update fetching logic to query `.select('*, main_sections(*)')` or similar nested queries.

**Phase 3: Component State & Form Updates**
- Update Section creation forms to support parent/child assignment.
- Update `ProjectAddPartModal.tsx` and `PartJSONImport` mapping logic to resolve both Main Section and Subsection.

**Phase 4: UI/UX Rendering Overhaul**
- Safely update `ProjectDetails.tsx` to handle the nested map rendering `project.main_sections.map(ms => ms.subsections.map(sub => ...))`.

## 5. Verification Checklist
- [ ] Schema updated without data loss.
- [ ] Existing project sections correctly migrated to a Default Main Section.
- [ ] UI successfully renders the two-tier hierarchy.
- [ ] Part Import JSON supports the new hierarchy.
- [ ] CSV/TXT exports accurately reflect the nested groupings.
