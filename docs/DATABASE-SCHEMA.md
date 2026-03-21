# Database Schema for PayTrack

This document outlines the production-ready PostgreSQL schema for the "PayTrack" application, designed to ensure strict financial data integrity while handling highly flexible loan and payment processes. The improvements below address critical gaps, ensuring security, clean data design, and real-world usability. Supabase will manage authentication and access control, leveraging `auth.uid()` for RLS.

---

## 1. Table Definitions

### **borrowers** (Directory)

Stores borrower contact information and securely links borrowers to authenticated users.

| Column Name  | Data Type   | Constraints                                 | Default Value     | Description                                                 |
| ------------ | ----------- | ------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| id           | UUID        | PRIMARY KEY, NOT NULL                       | gen_random_uuid() | Unique identifier for the borrower.                         |
| user_id      | UUID        | REFERENCES auth.users(id) ON DELETE CASCADE |                   | Links the borrower record to a specific authenticated user. |
| first_name   | TEXT        | NOT NULL                                    |                   | First name of the borrower.                                 |
| last_name    | TEXT        | NOT NULL                                    |                   | Last name of the borrower.                                  |
| email        | TEXT        | UNIQUE                                      |                   | Email of the borrower.                                      |
| phone_number | TEXT        |                                             |                   | Phone number of the borrower.                               |
| created_at   | TIMESTAMPTZ | NOT NULL                                    | now()             | Timestamp of when the borrower was created.                 |
| updated_at   | TIMESTAMPTZ | NOT NULL                                    | now()             | Updated whenever borrower data changes.                     |

---

### **loans** (The Core Engine)

Tracks information about loans, linking them to authenticated users and storing critical loan metadata.

| Column Name             | Data Type     | Constraints                                        | Default Value     | Description                                                  |
| ----------------------- | ------------- | -------------------------------------------------- | ----------------- | ------------------------------------------------------------ |
| id                      | UUID          | PRIMARY KEY, NOT NULL                              | gen_random_uuid() | Unique identifier for the loan.                              |
| borrower_id             | UUID          | REFERENCES borrowers(id) ON DELETE CASCADE         |                   | Links loan to the borrower.                                  |
| user_id                 | UUID          | REFERENCES auth.users(id) ON DELETE CASCADE        |                   | Links the loan record to the authenticated user.             |
| release_date            | TIMESTAMPTZ   | NOT NULL                                           |                   | Date the loan is issued, anchors schedules.                  |
| principal_amount        | NUMERIC(12,2) | NOT NULL CHECK (principal_amount > 0)              |                   | The loan’s principal amount.                                 |
| loan_category           | TEXT          | NOT NULL CHECK (loan_category IN ('Small', 'Big')) |                   | Loan's category: "Small" (≤ 5,000), "Big" (> 5,000).         |
| term_type               | TEXT          | NOT NULL                                           |                   | Describes the loan's repayment term (e.g., Weekly, Monthly). |
| total_interest_expected | NUMERIC(12,2) | NOT NULL                                           | 0                 | Total interest expected on the loan.                         |
| rc_allocation           | NUMERIC(5,2)  | NOT NULL                                           | 80                | RC allocation percentage of total interest.                  |
| edith_allocation        | NUMERIC(5,2)  | NOT NULL                                           | 20                | EDITH allocation percentage of total interest.               |
| status                  | TEXT          | NOT NULL CHECK (status IN ('Active', 'Paid'))      | 'Active'          | Current status of the loan.                                  |
| created_at              | TIMESTAMPTZ   | NOT NULL                                           | now()             | Timestamp of when the loan was created.                      |
| updated_at              | TIMESTAMPTZ   | NOT NULL                                           | now()             | Updated whenever loan data changes.                          |

---

### **schedules** (The Auto-Generated Roadmap)

Stores system-generated payment schedules for loans.

| Column Name     | Data Type     | Constraints                            | Default Value     | Description                                       |
| --------------- | ------------- | -------------------------------------- | ----------------- | ------------------------------------------------- |
| id              | UUID          | PRIMARY KEY, NOT NULL                  | gen_random_uuid() | Unique identifier for the schedule entry.         |
| loan_id         | UUID          | REFERENCES loans(id) ON DELETE CASCADE |                   | Links schedule to the loan.                       |
| expected_date   | TIMESTAMPTZ   | NOT NULL                               |                   | The system-generated payment due date.            |
| expected_amount | NUMERIC(12,2) | NOT NULL CHECK (expected_amount > 0)   |                   | Expected payment amount for this due date.        |
| created_at      | TIMESTAMPTZ   | NOT NULL                               | now()             | Timestamp of when the schedule entry was created. |

---

### **payments** (The Ledger)

Logs borrower payment transactions, allowing for dynamic balance calculations. Context (notes) and payment methods are included for real-world usability.

| Column Name    | Data Type     | Constraints                            | Default Value     | Description                                                 |
| -------------- | ------------- | -------------------------------------- | ----------------- | ----------------------------------------------------------- |
| id             | UUID          | PRIMARY KEY, NOT NULL                  | gen_random_uuid() | Unique identifier for the payment.                          |
| loan_id        | UUID          | REFERENCES loans(id) ON DELETE CASCADE |                   | Links payment to the loan.                                  |
| amount_paid    | NUMERIC(12,2) | NOT NULL CHECK (amount_paid > 0)       |                   | The actual payment amount received.                         |
| date_paid      | TIMESTAMPTZ   | NOT NULL                               |                   | The date the payment was recorded.                          |
| payment_method | TEXT          |                                        |                   | Records the payment method (e.g., Cash, Bank Transfer).     |
| notes          | TEXT          |                                        |                   | Context for the payment, e.g., partial payment explanation. |
| created_at     | TIMESTAMPTZ   | NOT NULL                               | now()             | Timestamp of when the payment was logged.                   |

---

## 2. Recommended Row Level Security (RLS) Policies

To ensure that authenticated users only see or manipulate their own data, apply the appropriate **Row Level Security (RLS)** policies:

1. **Borrower-level RLS**

   ```sql
   CREATE POLICY "Borrower Access Policy" ON borrowers
   FOR SELECT, INSERT, UPDATE, DELETE
   USING (user_id = auth.uid());
   ```

2. **Loan-level RLS**

   ```sql
   CREATE POLICY "Loan Access Policy" ON loans
   FOR SELECT, INSERT, UPDATE, DELETE
   USING (user_id = auth.uid());
   ```

3. **Schedule and Payment-level RLS**

   ```sql
   CREATE POLICY "Schedule Access Policy" ON schedules
   FOR SELECT, INSERT, UPDATE, DELETE
   USING (EXISTS (SELECT 1 FROM loans WHERE schedules.loan_id = loans.id AND loans.user_id = auth.uid()));

   CREATE POLICY "Payment Access Policy" ON payments
   FOR SELECT, INSERT, UPDATE, DELETE
   USING (EXISTS (SELECT 1 FROM loans WHERE payments.loan_id = loans.id AND loans.user_id = auth.uid()));
   ```

---

This refined schema is optimized for secure multi-user operations, strict financial integrity, and real-world application needs while maintaining flexibility and consistency.
