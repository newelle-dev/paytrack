import { addDays, addMonths, startOfDay, parseISO } from "date-fns";

// --- Types ---
export interface ScheduleInput {
  expectedDate: string; // ISO String
  expectedAmount: number; // Decimal (e.g., 1375.00)
}

export interface LoanCalculationResult {
  schedules: ScheduleInput[];
  totalInterestExpected: number; // Decimal
  rcAllocation: number; // Decimal
  edithAllocation: number; // Decimal
}

// --- Internal Helper: Calculate RC & EDITH Allocations ---
function calculateAllocations(totalInterestCents: number) {
  const rcCents = Math.round(totalInterestCents * 0.8);

  // Failsafe: Ensure splits perfectly match the total (fixes potential rounding drift)
  const adjustedEdithCents = totalInterestCents - rcCents;

  return {
    rcAllocation: rcCents / 100,
    edithAllocation: adjustedEdithCents / 100,
  };
}

// --- ENGINE 1: Small Loans (<= 5,000) ---
export function calculateSmallLoan(
  principal: number,
  releaseDateStr: string,
  termType: "Weekly" | "1-Month" | "Semi-Monthly",
): LoanCalculationResult {
  const principalCents = Math.round(principal * 100);
  const interestCents = Math.round(principalCents * 0.1); // Flat 10%
  const totalCents = principalCents + interestCents;

  const releaseDate = startOfDay(parseISO(releaseDateStr));
  const schedules: ScheduleInput[] = [];

  switch (termType) {
    case "Weekly": {
      const weeklyPaymentCents = Math.round(totalCents / 4);
      let remainingCents = totalCents;

      for (let i = 1; i <= 4; i++) {
        // Sweeper for the final payment to ensure exact total
        const payment = i === 4 ? remainingCents : weeklyPaymentCents;
        schedules.push({
          expectedDate: addDays(releaseDate, i * 7).toISOString(),
          expectedAmount: payment / 100,
        });
        remainingCents -= payment;
      }
      break;
    }

    case "1-Month": {
      schedules.push({
        expectedDate: addMonths(releaseDate, 1).toISOString(),
        expectedAmount: totalCents / 100,
      });
      break;
    }

    case "Semi-Monthly": {
      // 1st payment is 15 days after release date
      const firstPayday = addDays(releaseDate, 15);
      // 2nd payment is exactly 1 month after release date
      const secondPayday = addMonths(releaseDate, 1);

      const halfPaymentCents = Math.round(totalCents / 2);
      schedules.push(
        {
          expectedDate: firstPayday.toISOString(),
          expectedAmount: halfPaymentCents / 100,
        },
        {
          expectedDate: secondPayday.toISOString(),
          expectedAmount: (totalCents - halfPaymentCents) / 100,
        },
      );
      break;
    }
  }

  const { rcAllocation, edithAllocation } = calculateAllocations(interestCents);

  return {
    schedules,
    totalInterestExpected: interestCents / 100,
    rcAllocation,
    edithAllocation,
  };
}

// --- ENGINE 2: Big Loans (> 5,000) ---
export function calculateBigLoan(
  principal: number,
  releaseDateStr: string,
  numMonths: number,
): LoanCalculationResult {
  const principalCents = Math.round(principal * 100);
  const releaseDate = startOfDay(parseISO(releaseDateStr));

  const schedules: ScheduleInput[] = [];
  const monthlyPrincipalCents = Math.round(principalCents / numMonths);

  let remainingPrincipalCents = principalCents;
  let accumulatedInterestCents = 0;

  for (let i = 1; i <= numMonths; i++) {
    // 1. Calculate this month's interest based on remaining balance
    const interestCents = Math.round(remainingPrincipalCents * 0.1);
    accumulatedInterestCents += interestCents;

    // 2. Determine Principal Payment (Sweeper handles the final month rounding dust)
    const currentPrincipalPayment =
      i === numMonths ? remainingPrincipalCents : monthlyPrincipalCents;
    const totalPaymentCents = currentPrincipalPayment + interestCents;

    // 3. Add to Schedule
    schedules.push({
      expectedDate: addMonths(releaseDate, i).toISOString(),
      expectedAmount: totalPaymentCents / 100,
    });

    // 4. Decrement remaining principal for the next loop
    remainingPrincipalCents -= currentPrincipalPayment;
  }

  const { rcAllocation, edithAllocation } = calculateAllocations(
    accumulatedInterestCents,
  );

  return {
    schedules,
    totalInterestExpected: accumulatedInterestCents / 100,
    rcAllocation,
    edithAllocation,
  };
}
