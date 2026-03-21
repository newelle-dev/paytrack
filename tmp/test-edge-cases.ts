import { calculateSmallLoan, calculateBigLoan } from "../lib/utils/loanMath";

function testSmallLoan() {
  console.log("--- SMALL LOAN EDGE CASES ---");
  // Test Feb edge dates for Semi-Monthly (15th/30th)
  // Non-leap year: 2026-02-15
  const res1 = calculateSmallLoan(5000, "2026-02-13", "Semi-Monthly");
  console.log("Release: 2026-02-13 (Semi-Monthly)");
  res1.schedules.forEach((s) =>
    console.log(`${s.expectedDate} => ${s.expectedAmount}`),
  );

  const res2 = calculateSmallLoan(5000, "2026-01-31", "Semi-Monthly");
  console.log("Release: 2026-01-31 (Semi-Monthly)");
  res2.schedules.forEach((s) =>
    console.log(`${s.expectedDate} => ${s.expectedAmount}`),
  );
  console.log("-----------------------------\n");
}

function testBigLoan() {
  console.log("--- BIG LOAN EDGE CASES ---");
  const res = calculateBigLoan(10000, "2026-01-31", 6);
  console.log("Release: 2026-01-31 (6 months)");
  res.schedules.forEach((s) =>
    console.log(`${s.expectedDate} => ${s.expectedAmount}`),
  );
  console.log("-----------------------------\n");
}

testSmallLoan();
testBigLoan();
