# Master BOM Manager (Registry v3)

A high-performance, engineering-first BOM (Bill of Materials) Management system. Built for streamlined part registration, cross-project inventory tracking, and integrated CAD/Engineering asset management.

## 🚀 Key Features

- **Master Registry Management:** Unified database for all engineering parts (Mechanical, Electrical, Pneumatic).
- **Project-Specific BOMs:** Build and customize BOMs for specific projects with estimated vs actual cost tracking.
- **Stock Movement & In/Out Tracking:** Real-time inventory adjustments with detailed audit logs.
- **Integrated Digital Assets:** 
  - Clipboard (Ctrl+V) image paste for lightning-fast asset registration.
  - Storage for CAD Geometry (.STEP), PDF Drawings, and Technical Datasheets.
  - **Unified 'bom_assets' Storage:** Simplified single-bucket configuration.
- **Smart Import/Export:**
  - Strict JSON validation for part imports to ensure registry integrity.
  - CSV/JSON export for project-level reporting and PO generation.
- **Supplier Directory:** Integrated supplier management for streamlined sourcing.

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Vanilla CSS + Tailwind
- **Backend:** Supabase (Database & Auth)
- **Storage:** Supabase Storage (Unified Bucket)
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Project

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd V3/bom-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the `bom-manager` directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Deployment & Production

For production setup instructions including Supabase RLS policies and Storage Bucket configuration, refer to:
**[docs/PRODUCTION_SETUP.md](./docs/PRODUCTION_SETUP.md)**

## 📧 Support & Maintenance

This repository is maintained as a Master Engineering Registry for the Bep BOM Ecosystem.
