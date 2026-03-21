"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ReceiptText, CircleDot, AlertCircle, ChevronDown, ChevronRight, History } from "lucide-react";
import { format, parseISO } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markLoanAsPaid } from "@/app/(dashboard)/loans/actions";
import { PaymentModal } from "@/components/payment-modal";
import { type Loan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface LoanDetailClientProps {
  initialData: Loan;
}

export function LoanDetailClient({ initialData }: LoanDetailClientProps) {
  const router = useRouter();
  const loan = initialData;
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const totalExpected = loan.principal_amount + loan.total_interest_expected;
  const totalPaid = totalExpected - (loan.remaining_balance || 0);
  const progressPercentage = totalExpected > 0 ? Math.min(100, Math.max(0, (totalPaid / totalExpected) * 100)) : 0;

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") return "success";
    if (s === "defaulted") return "error";
    return "default"; // paid
  };

  // Merge payments into schedules
  const payments = [...(loan.payments || [])].sort(
    (a, b) => new Date(a.date_paid).getTime() - new Date(b.date_paid).getTime()
  );
  let currentPaymentIdx = 0;
  let remainingInCurrentPayment =
    payments.length > 0 ? payments[0].amount_paid : 0;

  const combinedSchedules = [...(loan.schedules || [])]
    .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())
    .map((schedule) => {
    let expected = schedule.expected_amount;
    let amountPaidForThisSchedule = 0;
    let lastDatePaid: string | null = null;
    const paymentsForThisSchedule: any[] = [];

    while (expected > 0.01 && currentPaymentIdx < payments.length) {
      const p = payments[currentPaymentIdx];

      if (remainingInCurrentPayment >= expected) {
        amountPaidForThisSchedule += expected;
        paymentsForThisSchedule.push({ ...p, amount_allocated: expected });
        remainingInCurrentPayment -= expected;
        lastDatePaid = p.date_paid;
        expected = 0;

        if (remainingInCurrentPayment < 0.01) {
          currentPaymentIdx++;
          remainingInCurrentPayment =
            currentPaymentIdx < payments.length
              ? payments[currentPaymentIdx].amount_paid
              : 0;
        }
      } else {
        amountPaidForThisSchedule += remainingInCurrentPayment;
        paymentsForThisSchedule.push({ ...p, amount_allocated: remainingInCurrentPayment });
        expected -= remainingInCurrentPayment;
        lastDatePaid = p.date_paid;
        currentPaymentIdx++;
        remainingInCurrentPayment =
          currentPaymentIdx < payments.length
            ? payments[currentPaymentIdx].amount_paid
            : 0;
      }
    }

    let status: "PAID" | "PARTIAL" | "UPCOMING" | "OVERDUE" = "UPCOMING";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedDate = parseISO(schedule.expected_date);

    if (amountPaidForThisSchedule >= schedule.expected_amount - 0.01) {
      status = "PAID";
    } else if (amountPaidForThisSchedule > 0) {
      status = "PARTIAL";
    } else if (expectedDate < today) {
      status = "OVERDUE";
    }

    return {
      ...schedule,
      status,
      amount_paid: amountPaidForThisSchedule,
      date_paid: lastDatePaid,
      history: paymentsForThisSchedule,
    };
  });

  let suggestedAmount = 0;
  let foundUpcoming = false;
  for (const s of combinedSchedules) {
    if (s.status === "PAID") continue;
    
    // Add the balance of this schedule
    const balance = Math.max(0, s.expected_amount - s.amount_paid);
    suggestedAmount += balance;

    // If this was an upcoming payment (not overdue) and was untouched, 
    // it counts as the "next" payment, so we stop here.
    if (s.status === "UPCOMING" && s.amount_paid === 0) {
      foundUpcoming = true;
      break;
    }
  }

  // Fallback to remaining balance if no unpaid schedules found 
  // (though the button is usually hidden in that case)
  if (suggestedAmount === 0 && (loan.remaining_balance || 0) > 0) {
    suggestedAmount = loan.remaining_balance || 0;
  }

  const handleMarkAsPaid = async () => {
    if (!confirm("Are you sure you want to mark this loan as fully paid?"))
      return;

    setIsMarkingPaid(true);
    const result = await markLoanAsPaid(loan.id);
    if (result?.error) {
      alert("Error: " + result.error);
      setIsMarkingPaid(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/loans">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Loan Details
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {loan.borrower?.first_name} {loan.borrower?.last_name} &bull;{" "}
              {loan.loan_category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <Badge
              variant={getStatusVariant(loan.status)}
              className="px-3 py-1 text-xs font-bold uppercase tracking-widest border-2"
            >
              {loan.status}
            </Badge>
          </div>

          {loan.status.toLowerCase() === "active" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-gold hover:bg-gold-dark text-white border-0 shadow-sm active:scale-95 transition-all"
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                Log Payment
              </Button>

              <Button
                variant="outline"
                onClick={handleMarkAsPaid}
                disabled={isMarkingPaid}
                className="border-ivory-cream text-text-secondary hover:bg-ivory-cream/20 active:scale-95 transition-all shadow-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isMarkingPaid ? "Updating..." : "Mark as Paid"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loanId={loan.id}
        borrowerName={`${loan.borrower?.first_name} ${loan.borrower?.last_name}`}
        remainingBalance={loan.remaining_balance || 0}
        suggestedAmount={suggestedAmount}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Loan Summary & Borrower Info */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              {/* Repayment Progress */}
              <div className="flex flex-col gap-2 pb-4 border-b border-ivory-cream">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary uppercase tracking-widest">
                    Repayment Progress
                  </span>
                  <span className="font-mono font-bold text-success text-sm">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-ivory-light rounded-full overflow-hidden border border-ivory-cream">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mt-1">
                  <span>Paid: {formatCurrency(totalPaid)}</span>
                  <span>Total Due: {formatCurrency(totalExpected)}</span>
                </div>
              </div>

              <div>
                <p className="text-3xl font-mono font-semibold text-text-primary">
                  {formatCurrency(loan.principal_amount)}
                </p>
                <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">
                  Principal Amount
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-mono text-text-primary">
                    {formatCurrency(loan.remaining_balance || 0)}
                  </p>
                  <p className="text-xs text-text-secondary">Remaining Bal.</p>
                </div>
                <div>
                  <p className="font-mono text-text-primary">
                    {formatCurrency(loan.total_interest_expected)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Expected Interest
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-ivory-cream mt-2">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                    Term Type
                  </p>
                  <p className="font-semibold text-text-primary px-2 py-0.5 bg-ivory-light rounded border border-ivory-cream inline-block self-start text-xs uppercase">
                    {loan.term_type}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                    Release Date
                  </p>
                  <p className="font-mono text-text-primary font-medium">
                    {loan.release_date
                      ? format(parseISO(loan.release_date), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium uppercase tracking-widest">
                      RC Allocation
                    </span>
                    <span className="font-mono font-bold text-text-primary">
                      {loan.rc_allocation}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ivory-light rounded-full overflow-hidden border border-ivory-cream">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-1000"
                      style={{ width: `${loan.rc_allocation}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary text-right font-mono">
                    {formatCurrency(
                      (loan.rc_allocation / 100) * loan.total_interest_expected,
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium uppercase tracking-widest">
                      EDITH Allocation
                    </span>
                    <span className="font-mono font-bold text-text-primary">
                      {loan.edith_allocation}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ivory-light rounded-full overflow-hidden border border-ivory-cream">
                    <div
                      className="h-full bg-ivory-cream rounded-full transition-all duration-1000"
                      style={{ width: `${loan.edith_allocation}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary text-right font-mono">
                    {formatCurrency(
                      (loan.edith_allocation / 100) *
                        loan.total_interest_expected,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Borrower Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
              <p className="font-medium text-text-primary">
                {loan.borrower?.first_name} {loan.borrower?.last_name}
              </p>
              {loan.borrower?.email && (
                <p className="text-sm text-text-secondary">
                  {loan.borrower.email}
                </p>
              )}
              {loan.borrower?.phone_number && (
                <p className="text-sm text-text-secondary">
                  {loan.borrower.phone_number}
                </p>
              )}
              <Link href={`/borrowers/${loan.borrower?.id}`} className="w-full">
                <Button variant="outline" className="mt-2 w-full text-xs">
                  View Borrower Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Schedule */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-gold" />
                Payment Schedule
              </CardTitle>
              <CardDescription>
                Expected collection dates vs actual payments
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead className="pl-6 w-[140px]">Status</TableHead>
                    <TableHead>Date Expected</TableHead>
                    <TableHead className="text-right">Expected Amount</TableHead>
                    <TableHead className="pl-6">Date Paid</TableHead>
                    <TableHead className="text-right pr-6">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-text-secondary"
                      >
                        No schedule available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    combinedSchedules.map((schedule, idx) => {
                      const isExpanded = expandedRows.has(schedule.id);
                      const hasHistory = schedule.history && schedule.history.length > 0;
                      
                      return (
                        <React.Fragment key={schedule.id}>
                          <TableRow 
                            className={`cursor-pointer transition-colors ${isExpanded ? "bg-ivory-light/30" : "hover:bg-ivory-light/10"}`}
                            onClick={() => hasHistory && toggleRow(schedule.id)}
                          >
                            <TableCell className="pl-6 font-medium">
                              <div className="flex items-center gap-2">
                                {hasHistory && (
                                  <div className="text-text-secondary mr-1">
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  </div>
                                )}
                                {schedule.status === "PAID" && (
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                )}
                                {schedule.status === "PARTIAL" && (
                                  <History className="h-4 w-4 text-amber-500 animate-pulse-slow" />
                                )}
                                {schedule.status === "UPCOMING" && (
                                  <CircleDot className="h-4 w-4 text-gold" />
                                )}
                                {schedule.status === "OVERDUE" && (
                                  <AlertCircle className="h-4 w-4 text-error" />
                                )}
                                <span
                                  className={`text-[10px] font-bold tracking-tight ${
                                    schedule.status === "PAID"
                                      ? "text-success"
                                      : schedule.status === "PARTIAL"
                                      ? "text-amber-600"
                                      : schedule.status === "OVERDUE"
                                      ? "text-error"
                                      : "text-gold"
                                  }`}
                                >
                                  {schedule.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-text-primary">
                              <span className="text-text-secondary mr-2 text-xs font-mono">
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                              {format(
                                parseISO(schedule.expected_date),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium text-text-primary">
                              {formatCurrency(schedule.expected_amount)}
                            </TableCell>
                            <TableCell className="text-text-secondary pl-6">
                              {schedule.date_paid
                                ? format(parseISO(schedule.date_paid), "MMM d, yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right pr-6 font-mono font-bold text-success">
                              {schedule.amount_paid > 0
                                ? `+ ${formatCurrency(schedule.amount_paid)}`
                                : "-"}
                            </TableCell>
                          </TableRow>
                          
                          {isExpanded && hasHistory && (
                            <TableRow className="border-0 bg-ivory-light/20">
                              <TableCell colSpan={5} className="py-0 px-6">
                                <div className="border-l-2 border-gold/40 my-3 pl-4 flex flex-col gap-2">
                                  <div className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-1">
                                    Allocated Transactions
                                  </div>
                                  {schedule.history.map((h: any, hIdx: number) => (
                                    <div key={h.id} className="grid grid-cols-4 items-center text-xs py-1 border-b border-ivory-cream last:border-0">
                                      <div className="text-text-secondary flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-gold" />
                                        {format(parseISO(h.date_paid), "MMM d, yyyy")}
                                      </div>
                                      <div className="text-text-secondary italic">
                                        {h.payment_method}
                                      </div>
                                      <div className="col-span-1 text-text-secondary opacity-70 truncate" title={h.notes || "No notes"}>
                                        {h.notes || "-"}
                                      </div>
                                      <div className="text-right font-mono font-semibold text-text-primary">
                                        {formatCurrency(h.amount_allocated)}
                                      </div>
                                    </div>
                                  ))}
                                  {schedule.status === "PARTIAL" && (
                                    <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      Remaining balance for this installment: {formatCurrency(schedule.expected_amount - schedule.amount_paid)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
