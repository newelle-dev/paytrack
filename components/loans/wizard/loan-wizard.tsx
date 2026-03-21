"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  calculateSmallLoan,
  calculateBigLoan,
  LoanCalculationResult,
} from "@/lib/utils/loanMath";
import { format } from "date-fns";
import { createLoan } from "@/app/(dashboard)/loans/actions";
import { useRouter } from "next/navigation";
import { Borrower } from "@/lib/types";

interface LoanWizardProps {
  initialBorrowers: Borrower[];
}

export function LoanWizard({ initialBorrowers }: LoanWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [borrowerId, setBorrowerId] = useState<string>("");
  const [principalAmount, setPrincipalAmount] = useState<string>("");
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [termType, setTermType] = useState<
    "Weekly" | "1-Month" | "Semi-Monthly" | ""
  >("");
  const [numMonths, setNumMonths] = useState<string>("");

  // Calculation State
  const [calcResult, setCalcResult] = useState<LoanCalculationResult | null>(
    null,
  );
  const [rcDollar, setRcDollar] = useState<string>("");
  const [edithDollar, setEdithDollar] = useState<string>("");
  const [rcPercent, setRcPercent] = useState<string>("");
  const [edithPercent, setEdithPercent] = useState<string>("");
  const [allocationError, setAllocationError] = useState<string>("");

  const parsedPrincipal = Number(principalAmount);
  const isBigLoan = parsedPrincipal > 5000;

  const handleNextToStep3 = () => {
    if (!principalAmount || !releaseDate) return;
    if (!isBigLoan && !termType) return;
    if (isBigLoan && !numMonths) return;

    let result: LoanCalculationResult;
    if (isBigLoan) {
      result = calculateBigLoan(
        parsedPrincipal,
        releaseDate,
        Number(numMonths),
      );
    } else {
      result = calculateSmallLoan(
        parsedPrincipal,
        releaseDate,
        termType as "Weekly" | "1-Month" | "Semi-Monthly",
      );
    }

    setCalcResult(result);

    // Default 80/20 setup based on the initial mathematical output
    setRcDollar(result.rcAllocation.toFixed(2));
    setEdithDollar(result.edithAllocation.toFixed(2));
    setRcPercent("80.00");
    setEdithPercent("20.00");

    setAllocationError("");
    setStep(3);
  };

  const handleCustomAllocationChange = (
    type: "RC_$" | "EDITH_$" | "RC_%" | "EDITH_%",
    val: string,
  ) => {
    // 1. Update the typed field directly to preserve user cursor/input perfectly
    if (type === "RC_$") setRcDollar(val);
    if (type === "EDITH_$") setEdithDollar(val);
    if (type === "RC_%") setRcPercent(val);
    if (type === "EDITH_%") setEdithPercent(val);

    if (!calcResult) return;
    const expected = calcResult.totalInterestExpected;

    const valNum = Number(val);
    if (isNaN(valNum)) return; // Do not run math if user types incomplete string like "."

    let newRc = Number(rcDollar);
    let newEdith = Number(edithDollar);

    // 2. Auto-derive the opposites
    if (type === "RC_%") {
      newRc = (valNum / 100) * expected;
      newEdith = expected - newRc;
      setRcDollar(newRc.toFixed(2));
      setEdithDollar(newEdith.toFixed(2));
      setEdithPercent((100 - valNum).toFixed(2));
    } else if (type === "EDITH_%") {
      newEdith = (valNum / 100) * expected;
      newRc = expected - newEdith;
      setEdithDollar(newEdith.toFixed(2));
      setRcDollar(newRc.toFixed(2));
      setRcPercent((100 - valNum).toFixed(2));
    } else if (type === "RC_$") {
      newRc = valNum;
      newEdith = expected - newRc;
      setEdithDollar(newEdith.toFixed(2));
      setRcPercent(
        expected > 0 ? ((newRc / expected) * 100).toFixed(2) : "0.00",
      );
      setEdithPercent(
        expected > 0 ? ((newEdith / expected) * 100).toFixed(2) : "0.00",
      );
    } else if (type === "EDITH_$") {
      newEdith = valNum;
      newRc = expected - newEdith;
      setRcDollar(newRc.toFixed(2));
      setRcPercent(
        expected > 0 ? ((newRc / expected) * 100).toFixed(2) : "0.00",
      );
      setEdithPercent(
        expected > 0 ? ((newEdith / expected) * 100).toFixed(2) : "0.00",
      );
    }

    // 3. Validation Check against exact dollar expected
    const total = Number((newRc + newEdith).toFixed(2));
    const expectedRounded = Number(expected.toFixed(2));

    if (total !== expectedRounded) {
      setAllocationError(
        `Allocations must sum to ₱${expectedRounded.toFixed(2)}. Current sum: ₱${total.toFixed(2)}`,
      );
    } else {
      setAllocationError("");
    }
  };

  const nextStep = () => {
    if (step === 2) {
      handleNextToStep3();
      return;
    }
    if (step === 3 && allocationError) {
      return; // Prevent moving to confirm if error exists
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleCreateLoan = async () => {
    if (!calcResult || !borrowerId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      borrowerId,
      principalAmount: parsedPrincipal,
      releaseDate,
      loanCategory: isBigLoan ? ("Big" as const) : ("Small" as const),
      termType: isBigLoan ? "Custom" : termType,
      totalInterestExpected: calcResult.totalInterestExpected,
      rcAllocation: Number(rcPercent),
      edithAllocation: Number(edithPercent),
      schedules: calcResult.schedules,
    };

    const result = await createLoan(payload);

    if (result.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    } else {
      router.push(`/loans/${result.loanId}`);
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const selectedBorrower = initialBorrowers.find((b) => b.id === borrowerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm font-medium">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 relative">
            <div
              className={`flex items-center gap-2 ${step >= s ? "text-primary" : "text-text-secondary"} bg-background z-10 pr-2`}
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= s ? "bg-primary text-primary-foreground" : "bg-bg-tertiary"}`}
              >
                {s}
              </div>
              <span className="hidden sm:inline">
                {s === 1
                  ? "Borrower"
                  : s === 2
                    ? "Details"
                    : s === 3
                      ? "Review"
                      : "Confirm"}
              </span>
            </div>
            {s < 4 && (
              <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-0" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Select Borrower"}
            {step === 2 && "Loan Details"}
            {step === 3 && "Schedule & Form Allocations"}
            {step === 4 && "Confirm & Create"}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              "Choose an existing borrower to assign this loan to."}
            {step === 2 && "Enter the principal amount and repayment terms."}
            {step === 3 &&
              "Review the auto-generated schedule and profit allocation."}
            {step === 4 &&
              "Finalize the details before saving to the database."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="borrower">Borrower</Label>
              <Select
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
              >
                <option value="" disabled>
                  Select a borrower...
                </option>
                {initialBorrowers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.first_name}{b.last_name ? ` ${b.last_name}` : ""}{" "}
                    {b.email ? `(${b.email})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Amount (₱)</Label>
                <Input
                  id="principal"
                  type="number"
                  placeholder="e.g. 5000"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>

              {parsedPrincipal > 0 && parsedPrincipal <= 5000 && (
                <div className="space-y-2">
                  <Label htmlFor="termType">Repayment Term (Small Loan)</Label>
                  <Select
                    value={termType}
                    onChange={(e) =>
                      setTermType(
                        e.target.value as
                          | "Weekly"
                          | "1-Month"
                          | "Semi-Monthly",
                      )
                    }
                  >
                    <option value="" disabled>
                      Select term...
                    </option>
                    <option value="Weekly">Weekly (4 payments)</option>
                    <option value="1-Month">1-Month (1 payment)</option>
                    <option value="Semi-Monthly">
                      Semi-Monthly (2 payments)
                    </option>
                  </Select>
                </div>
              )}

              {parsedPrincipal > 5000 && (
                <div className="space-y-2">
                  <Label htmlFor="numMonths">
                    Term Length (Months) - Big Loan
                  </Label>
                  <Input
                    id="numMonths"
                    type="number"
                    placeholder="e.g. 6"
                    value={numMonths}
                    onChange={(e) => setNumMonths(e.target.value)}
                  />
                  <p className="text-xs text-text-secondary">
                    Big loans are amortized based on declining balance over{" "}
                    {numMonths || "X"} months.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && calcResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-bg-secondary p-4 rounded-lg">
                <div>
                  <p className="text-sm text-text-secondary">Principal</p>
                  <p className="font-medium">₱{parsedPrincipal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    Total Interest Expected
                  </p>
                  <p className="font-medium text-success">
                    ₱{calcResult.totalInterestExpected.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Expected Schedule</h3>
                <div className="border rounded-md divide-y overflow-hidden text-sm">
                  {calcResult.schedules.map((sch, i) => (
                    <div
                      key={i}
                      className="flex justify-between p-3 bg-background"
                    >
                      <span>
                        {format(new Date(sch.expectedDate), "MMM do, yyyy")}
                      </span>
                      <span className="font-medium">
                        ₱{sch.expectedAmount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Profit Allocations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RC Group */}
                  <div className="space-y-4 p-4 border border-border rounded-md bg-background">
                    <h4 className="font-medium text-sm text-text-primary">
                      RC Allocation
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rcPercent}
                          onChange={(e) =>
                            handleCustomAllocationChange("RC_%", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₱)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rcDollar}
                          onChange={(e) =>
                            handleCustomAllocationChange("RC_$", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* EDITH Group */}
                  <div className="space-y-4 p-4 border border-border rounded-md bg-background">
                    <h4 className="font-medium text-sm text-text-primary">
                      EDITH Allocation
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={edithPercent}
                          onChange={(e) =>
                            handleCustomAllocationChange(
                              "EDITH_%",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₱)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={edithDollar}
                          onChange={(e) =>
                            handleCustomAllocationChange(
                              "EDITH_$",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {allocationError && (
                  <p className="text-sm text-destructive font-medium">
                    {allocationError}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Loan Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">Borrower</span>
                    <span className="font-medium">
                      {selectedBorrower?.first_name}
                      {selectedBorrower?.last_name
                        ? ` ${selectedBorrower.last_name}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">Category</span>
                    <Badge variant="outline">
                      {isBigLoan ? "Big Loan" : "Small Loan"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">
                      Principal Amount
                    </span>
                    <span className="font-medium">
                      ₱{parsedPrincipal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">Term</span>
                    <span className="font-medium">
                      {isBigLoan ? `${numMonths} Months` : termType}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">
                      Total Interest Expected
                    </span>
                    <span className="font-medium text-success">
                      ₱{calcResult?.totalInterestExpected.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">Release Date</span>
                    <span className="font-medium">
                      {releaseDate ? format(new Date(releaseDate), "PPP") : ""}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">RC Allocation</span>
                    <span className="font-medium">
                      {rcPercent}% (₱{Number(rcDollar).toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-text-secondary">
                      EDITH Allocation
                    </span>
                    <span className="font-medium">
                      {edithPercent}% (₱{Number(edithDollar).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={step === 4 ? handleCreateLoan : nextStep}
            disabled={
              isSubmitting ||
              (step === 1 && !borrowerId) ||
              (step === 2 &&
                (!principalAmount ||
                  !releaseDate ||
                  (!isBigLoan && !termType) ||
                  (isBigLoan && !numMonths))) ||
              (step === 3 && !!allocationError)
            }
          >
            {step === 4 ? "Save Loan & Schedules" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
