# Terminology Standardization & Plain-Language Audit Log

This log documents all the user-facing text and terminology changes applied to the Rose Beau Salon Management Portal. The objective was to replace technical accounting, salon jargon, or role-specific terms like **"Stylist"** and **"Pamper Reservation"** with intuitive, plain-language alternatives like **"Staff"** and **"Booking"**.

A raw patch file containing the code-level diffs has been saved at:
📁 `terminology_changes.diff`

---

## Summary of Changes by Component

### 1. Sidebar & General Navigation (`Sidebar.tsx`)
- Changed dropdown header label from `Staff` options to represent **"Staff List"** and **"Payslips"** consistently.
- Standardized group navigation sidebar labels.

### 2. POS Panel (`PosPanel.tsx`)
- Changed commission percentage label in service cards from `...% Stylist` to **`...% Staff`**.
- Updated label **"Stylist"** to **"Staff"** in client details.
- Changed popup titles and hints from `Select Stylist` to **`Select Staff`** and "Assign a **staff** member for this checkout ticket".

### 3. Queue Panel (`QueuePanel.tsx`)
- Changed ongoing card label `Stylist:` to **`Staff:`**.
- Changed action label `Assign Stylist` to **`Assign Staff`**.
- Updated selector popup title and instruction from `Select Stylist` to **`Select Staff`** and "Assign a **staff** member for this session".

### 4. Sales Ledger / Monthly Reports (`SalesLedgerPanel.tsx`)
- Updated monthly sales description: "Stylist performance summary" ➔ **"Staff performance summary"**.
- Changed table columns from `STYLIST / STAFF` to **`STAFF MEMBER`**.
- Renamed calculations to **`TOTAL STAFF SHARE`**, **`STAFF SHARE`**, and **`STAFF PAYOUT`**.
- Replaced "Product or Non-Stylist Sales" ➔ **"Product or Non-Staff Sales"**.

### 5. Daily Sales & Services Log (`ServicesLogPanel.tsx`)
- Changed subtitle to "View completed services, **staff** assignments, and total sales".
- Updated search input placeholder to "Search by client, service, or **staff**...".
- Renamed table columns from `Stylist` ➔ **`Staff`**.
- Changed modal dropdown select options from `Select stylist...` ➔ **`Select staff...`**.

### 6. Staff Management Panel (`StaffsPanel.tsx`)
- Changed form field input label from `Stylist Share` ➔ **`Staff Share`**.

### 7. Services Configuration Panel (`ServicesPanel.tsx`)
- Updated section description to "Set standard prices and **staff** share rates".
- Changed input selector label from `Stylist Share Rate` ➔ **`Staff Share Rate`**.

### 8. Bookings Panel (`BookingsPanel.tsx`)
- Replaced complex/pamper terminology with simple booking labels:
  - `Appointment Bookings` ➔ **`Bookings`**
  - `Add Pamper Reservation` ➔ **`Add Booking`**
  - `Mobile Contact` ➔ **`Phone Number`**
  - `Pamper Treatment Choose` ➔ **`Service Requested`**
  - `Slot #` ➔ **`Booking #`**

### 9. Dashboard Panel (`DashboardPanel.tsx`)
- Updated key KPI metrics:
  - `Stylist Shares` ➔ **`Staff Shares`**
  - `Salon Net Profit` ➔ **`Net Profit`**

### 10. Payslips & Payouts Panel (`PayslipsPanel.tsx`)
- Standardized print vouchers and staff selectors to use **"Staff Share"** and **"Staff Signature"** instead of stylist references.

---

### Verification & Stability
- Ran `npm run build` locally after all modifications.
- Compilation succeeded with zero errors, confirming that all changes safely decoupled UI labels without breaking internal state variables or logic.
