# BOM Manager — Improvements Summary

## Files Modified / Created

### New Files
| File | Purpose |
|------|---------|
| `src/api/part-inout.ts` | API for Part In (stock receipt) and Part Out (project usage) |
| `src/api/purchase-orders.ts` | **Rewritten** — Added delete, status change, receive items, item management |
| `src/api/dashboard.ts` | **Rewritten** — Added fallback when `get_dashboard_stats` RPC doesn't exist |
| `src/pages/PartInOut.tsx` | New page with Part In / Part Out tabs |
| `src/pages/PurchaseOrders.tsx` | **Rewritten** — Status filter, detail modal, delete, quick status change |
| `src/components/purchase-orders/PODetailModal.tsx` | New — Full PO detail view with edit, status workflow, receive items, delete |
| `src/components/layout/AppLayout.tsx` | **Updated** — Added Stock Movement nav, active link highlighting |
| `src/App.tsx` | **Updated** — Added `/stock-movement` route |
| `sql/08_dashboard_stats_rpc.sql` | New — SQL function for dashboard (optional, has fallback) |

---

## Detailed Changes

### 1. Purchase Order — Fixed & Enhanced

**Problems fixed:**
- PO had no edit capability
- PO had no delete capability  
- PO had no status change workflow
- PO detail view was missing (clicking a PO did nothing)
- Receiving items didn't update stock on master part tables

**New features:**
- **PO Detail Modal** — Click any PO to see full details with line items
- **Status Workflow** — Pending → Sent → Confirmed → Partial/Received. Invalid transitions are blocked.
- **Quick Status Change** — One-click status advancement directly from the PO list
- **Receive Items** — Enter received quantities per line item; stock auto-updates on master parts
- **Edit Notes/Terms** — Editable when PO is in Pending or Sent status
- **Delete PO** — Only Pending or Cancelled POs can be deleted (with cascade delete of items)
- **Delete Line Items** — Remove individual items from a PO (only when editable)
- **Status Filter** — Filter PO list by status with count badges

**Status transition rules:**
```
Pending   → Sent, Cancelled
Sent      → Confirmed, Cancelled
Confirmed → Partial, Received, Cancelled
Partial   → Received, Cancelled
Received  → (terminal)
Cancelled → (terminal)
```

### 2. Part In / Part Out — New Feature

**Part In (Stock Receipt):**
- Select part from any of the 5 part tables
- Select supplier
- Enter quantity received
- Optional PO reference number
- Date of receipt
- Updates master part's `stock_quantity` and `received_qty`
- Logs receipt in `part_usage_logs` with "STOCK-IN:" prefix

**Part Out (Project Consumption):**
- Two views: Grouped by Project, or Flat list
- Grouped view with expandable project cards showing all parts consumed
- Total quantity consumed per project
- Site/location tracking
- Part type categorization

**Logic flow for Part In:**
1. User clicks "Receive Stock" button
2. Selects part from dropdown (shows current stock)
3. Selects supplier (mandatory)
4. Enters quantity and optional PO reference
5. On submit: master part stock increases, receipt is logged
6. History table shows all receipts with supplier and PO info

### 3. Dashboard Stats — Fixed

**Problem:** Dashboard called `supabase.rpc('get_dashboard_stats')` but this function didn't exist in the SQL scripts, causing the dashboard to crash.

**Fix:** 
- Added try/catch with fallback to direct count queries
- Created SQL file `sql/08_dashboard_stats_rpc.sql` to optionally create the RPC function for better performance
- Dashboard works either way now

### 4. Navigation — Updated

- Added "Stock Movement" nav item with `ArrowLeftRight` icon
- Added active link highlighting (blue background + left border)
- Positioned between "Parts" and "Projects" in the nav order

---

## Optional SQL to Run

### Dashboard Stats Function (Recommended)
Run `sql/08_dashboard_stats_rpc.sql` in Supabase SQL Editor for faster dashboard loading.
The dashboard works without it (uses fallback queries), but the RPC is more efficient.

---

## Remaining Improvements (Not Implemented — Future Work)

1. **Export functionality** — Export buttons on Parts/Projects pages are placeholders
2. **Pagination** — All tables load full datasets; add cursor-based pagination for scale
3. **Toast notifications** — Replace `alert()` / `confirm()` with a proper toast system (e.g., react-hot-toast)
4. **File upload in Part form** — FileUpload component exists but isn't wired into PartFormModal
5. **PO PDF generation** — Print/export PO as PDF for suppliers
6. **Negative stock prevention** — Add client-side validation before allowing Part Out if stock would go below 0
7. **Duplicate PO number guard** — Current timestamp-based PO numbers could collide; add UUID suffix
8. **Bulk operations** — Select multiple parts/POs for bulk delete/status change
9. **Audit trail** — Track who made changes (currently no user attribution)
10. **Real-time updates** — Use Supabase realtime subscriptions for multi-user environments
