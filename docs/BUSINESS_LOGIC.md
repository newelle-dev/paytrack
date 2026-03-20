# Business Logic & Calculation Engine for Arzi Business Dashboard

This document defines the core interfaces, mathematical calculations, and frontend state management for the "Arzi Business Dashboard." This serves as the absolute source of truth for frontend TypeScript state management and the utility functions required before persisting financial data to the Supabase backend.

--- 

## 1. Core TypeScript Interfaces

Strict TypeScript types ensure clarity and consistency in the calculation logic and state management.

```typescript
// Loan State
export interface Loan {
  id: string; // UUID assigned to the loan
  userId: string; // UUID linking the loan to the authenticated user
  borrowerId: string; // UUID linking the loan to a borrower
  loanCategory: "Small" | "Big"; // Loan category based on principal amount
  principalAmount: number; // Loan amount in NUMERIC(12,2), user-facing value
  releaseDate: string; // ISO date string (e.g., "2026-03-20")
  termType: "Weekly" | "1-Month" | "15th-30th" | "Custom"; // Repayment frequency ("Custom" is used for Big Loans)
  totalInterestExpected: number; // Interest calculated and rounded safely
  rcAllocation: number; // Defaulted to 80% of totalInterestExpected
  edithAllocation: number; // Defaulted to 20% of totalInterestExpected
  status: "Active" | "Paid"; // Loan activity status
  schedule: Schedule[]; // Array of auto-generated schedules
}

// Schedule Interface
export interface Schedule {
  id: string; // UUID for the schedule entry
  expectedDate: string; // ISO date string when payment is due
  expectedAmount: number; // Payment amount for the specific schedule in NUMERIC(12,2)
}

// Payment Interface
export interface Payment {
  id: string; // UUID for the payment
  loanId: string; // UUID linking to the associated loan
  amountPaid: number; // Actual payment amount in NUMERIC(12,2)
  datePaid: string; // ISO date string (e.g., "2026-03-25")
  paymentMethod: "Cash" | "Bank Transfer" | "Other"; // Payment method
  notes?: string; // Optional: Text describing specific payment context
}
```

---

## 2. Small Loan Engine (≤ 5,000)

### The Math
Small loans use a **flat 10% interest** model. The `totalInterestExpected` is simple and handled in **cents** to avoid floating-point errors:
```typescript
const totalInterestExpected = Math.round(principalAmountCents * 0.1);
```
Convert the result back to dollars for display:
```typescript
const totalInterest = totalInterestExpected / 100; // Convert from cents to dollars
```

For example:
- Principal: 5,000.00 (500,000 cents)
- Total Interest: 500,000 * 0.1 = 50,000 cents -> 500.00 dollars

---

### Schedule Generator
The system generates a schedule based on the `releaseDate` and the selected term:

#### Weekly (4 payments per month)
1. Divide the `(principal + interest)` in cents into **4 equal payment amounts**.
2. Generate payment dates by adding 7 days per interval from the `releaseDate`.

---

#### 1-Month (1 payment per month)
1. The total amount is due **exactly 1 month after the `releaseDate`**. 

---

#### 15th & 30th (2 payments per month)
1. Allocate **half the balance to each of the two payments**.
2. Safety logic is used to:
    - Align the **first payment** to the next possible chronological payday: either the **15th or end of the same** month.
    - Handle edge cases (Feb 18 -> End of Feb, April 20 -> End of April, etc.) with `date-fns` utilities like `endOfMonth`.

#### Implementation Example
```typescript
function generateSmallLoanSchedule(principalCents: number, totalInterestCents: number, releaseDate: string, termType: "Weekly" | "1-Month" | "15th-30th"): Schedule[] {
  const schedules: Schedule[] = [];
  const totalCents = principalCents + totalInterestCents;

  switch (termType) {
    case "Weekly": {
      const weeklyPayment = Math.round(totalCents / 4);
      for (let i = 1; i <= 4; i++) {
        schedules.push({
          id: generateUUID(),
          expectedDate: addDaysToISODate(releaseDate, i * 7),
          expectedAmount: weeklyPayment / 100, // Convert to dollars
        });
      }
      break;
    }
    case "1-Month": {
      schedules.push({
        id: generateUUID(),
        expectedDate: addMonthsToISODate(releaseDate, 1),
        expectedAmount: totalCents / 100, // Convert to dollars
      });
      break;
    }
    case "15th-30th": {
      const firstPayday = findNextPayday(releaseDate, 15);
      const secondPayday = findNextPayday(firstPayday, "endOfMonth");
      const halfPayment = Math.round(totalCents / 2);

      schedules.push(
        { id: generateUUID(), expectedDate: firstPayday, expectedAmount: halfPayment / 100 },
        { id: generateUUID(), expectedDate: secondPayday, expectedAmount: halfPayment / 100 }
      );
      break;
    }
  }

  return schedules;
}
```

---

## 3. Big Loan Engine (> 5,000)

### The Math (Amortization)
- Divide the `principal` into **equal monthly payments (principal amortization)**. The loan's `termType` is set to `"Custom"` with a specific number of months (`numMonths`).
- Calculate interest per month using the **remaining loan balance**.

Additionally, we must track a running total of the interest (`accumulatedInterestCents`) inside the calculation loop to pass to the RC/EDITH allocator.

#### Example: 50,000 Loan, 5 Months
- Principal: 50,000 (5,000,000 cents)
- Amortized Principal: 10,000 per month (1,000,000 cents)
- Month 1: 10,000 + (10% of 50,000) = 15,000
- Month 2: 10,000 + (10% of 40,000) = 14,000
- **Total accumulated interest**: 5,000

---

#### Implementation Example
```typescript
function generateBigLoanSchedule(principalCents: number, releaseDate: string, numMonths: number): { schedule: Schedule[], totalInterestCents: number } {
  const schedules: Schedule[] = [];
  const monthlyPrincipalCents = Math.round(principalCents / numMonths);
  let remainingPrincipalCents = principalCents;
  let accumulatedInterestCents = 0;

  for (let i = 1; i <= numMonths; i++) {
    const interestCents = Math.round(remainingPrincipalCents * 0.1);
    accumulatedInterestCents += interestCents;

    schedules.push({
      id: generateUUID(),
      expectedDate: addMonthsToISODate(releaseDate, i),
      expectedAmount: (monthlyPrincipalCents + interestCents) / 100, // Convert to dollars
    });

    remainingPrincipalCents -= monthlyPrincipalCents;
  }

  return { schedule: schedules, totalInterestCents: accumulatedInterestCents };
}
```

---

## 4. Profit Allocation State Management (RC & EDITH)

### Profit Allocation
Convert `totalInterestExpected` to cents and calculate:
- **RC (80%)**: `rcAllocationCents = Math.round(totalInterestCents * 0.8)`
- **EDITH (20%)**: `edithAllocationCents = Math.round(totalInterestCents * 0.2)`

Examples:
- Total Interest: 5,000 cents -> RC: 4,000 cents (40.00), EDITH: 1,000 cents (10.00)

---

### Manual Overrides
Form state must enforce validation:
```typescript
if ((newRcCents + newEdithCents) !== totalInterestCents) {
  throw new Error("Profit allocations must total the expected interest.");
}
```

---

### UI and Save Flow
1. Calculate RC/EDITH allocations automatically after running loan calculations.
2. Allow the user to override exact dollar values before the save.
3. Convert from cents back to standard decimals (`/ 100`) right before the Supabase `.insert()` payload.

By diligently handling cents instead of raw decimals, we ensure all operations are precise, consistent, and avoid floating-point rounding errors.