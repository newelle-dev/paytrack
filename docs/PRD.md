# Product Requirements Document (PRD)

## 1. Executive Summary & Problem Statement

### Executive Summary  
Arzi Business Dashboard is a cloud-based custom loan and payment tracking web application designed for lending business owners transitioning from manual tracking systems, typically Excel spreadsheets. This system aims to reduce errors, improve efficiency, and provide accurate insights into borrower accounts and profit allocations.

### Problem Statement  
Lending business owners rely on spreadsheets to track loans, manage payments, and calculate balances. This manual process is prone to errors, lacks scalability, and is time-consuming. Additionally, existing tools do not accommodate specific profit allocation models, such as 'RC' and 'EDITH.'

---

## 2. Target Audience & Core Use Cases

### Target Audience  
- **Primary User**: Lending business owners using spreadsheets for loan tracking.
- **Secondary Users (Future Consideration)**: Loan managers, borrowers (read-only view).

### Core Use Cases  
1. **Borrowers Directory**: Track and search borrowers with loan status (Active/Paid).

2. **Loan Creation Wizard (The Engine)**: Create loans with automatically generated payment schedules based on two distinct business rules:
   - **Small Loans (≤ 5,000)**: Applies a flat 10% interest rate to the principal. Supports fixed term schedules: Weekly (4x/month), 1-Month (1x/month), or 15th & 30th (2x/month).
   - **Big Loans (> 5,000)**: Applies a straight-line principal amortization with a declining interest model based on a custom number of months (e.g., a 50k loan over 5 months requires 10k principal + 10% interest on the remaining balance each month).
   - **Profit Allocation**: Automatically calculates an 80% ('RC') and 20% ('EDITH') split of the total interest, while explicitly allowing manual monetary overrides before saving.

3. **Payment Logging**: Record borrower payments (amount, date, notes) quickly and calculate remaining balances automatically.

4. **Dashboards**: View loans, payments, balances, and key metrics at a glance:
   - Total Active Loans
   - Outstanding Balances
   - Profit Allocations ('RC' and 'EDITH') breakdown.

---

## 3. V1 Scope

### Must-Haves  

1. **Borrower Directory**
   - Add, search, filter, and view borrower profiles.  
   - Fields: Name, Contact Information, Active Loans, Status (Active/Paid).

2. **Loan Creation Wizard**  
   - Guided flow for creating the two loan types (**Small ≤ 5k, Big > 5k**).
   - **Release Date Input**: The system must require the loan's "Release Date," which acts as the anchor date for generating an accurate payment schedule.
   - **Auto-Scheduling**: The system must generate expected payment dates and amounts based on the selected term (Weekly, Monthly, Bi-monthly, or Custom Months).
   - **Allocation Overrides**: UI must auto-fill RC (80%) and EDITH (20%) fields based on total interest, but these fields must be editable inputs for manual overrides before database commit.

3. **One-Click Payment Logging**  
   - **Input**: Select Borrower/Loan, Payment Amount, Date.  
   - **Logic**: Must accept arbitrary payment amounts (overpayments, underpayments, or irregular dates) and automatically decrement the remaining loan balance without forcing rigid adherence to the expected schedule.

4. **Dashboard Overview**  
   - Summary of:
     - Total Active Capital
     - Total Interest Expected
     - Total Profit Allocations ('RC', 'EDITH')
     - Payments Due Today / This Week (Crucial for daily operations).

---

## 4. Out of Scope for V1
1. Borrower-facing features (e.g., borrower portals or read-only dashboards).
2. SMS/email payment reminders.
3. Multi-user roles & permissions.
4. Custom report generation.
5. Integration with third-party accounting/payment platforms.

---

## 5. Design & UI Requirements (Modern Fintech Aesthetic)  

### Visual Identity  
The application must feel like a premium, institutional-grade financial tool (Modern Fintech SaaS).

### Color Palette (Tailwind):
- **Base/Background**: Crisp, high-contrast minimalist base (e.g., slate-50 or pure white for light mode) to ensure dense data tables are readable without eye strain.  
- **Primary Brand Color**: A sophisticated, muted metallic tone (e.g., a custom Bronze or deep Champagne Gold) used sparingly for primary buttons (like "Save Loan") and active navigation states to provide a premium feel without overwhelming the data.  
- **Semantic Colors**: Strict adherence to universally understood financial colors. High-contrast Green (e.g., emerald-600) for "Paid/Active" and Red (e.g., rose-600) for "Overdue/Deficit."  

### Typography  
Use a clean, geometric sans-serif (like Inter or Geist) with strict tabular-lining rules for all numbers so decimal points align perfectly in tables.

### Layout  
Distraction-free, card-based layouts with ample whitespace. The priority is rapid data entry and scannability for a user who may be on the go or quickly logging payments.

---

This PRD for Arzi Business Dashboard maintains focus on delivering a scalable, minimalistic solution catering to lending business owners' core needs, while providing a refined and modern fintech-inspired aesthetic.