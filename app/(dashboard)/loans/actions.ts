"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ScheduleInput } from "@/lib/utils/loanMath";

type CreateLoanPayload = {
  borrowerId: string;
  principalAmount: number;
  releaseDate: string;
  loanCategory: "Small" | "Big";
  termType: string;
  totalInterestExpected: number;
  rcAllocation: number;
  edithAllocation: number;
  schedules: ScheduleInput[];
};

export async function createLoan(payload: CreateLoanPayload) {
  const supabase = await createClient();

  // 1. Verify User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a loan." };
  }

  // 2. Validate payload
  if (!payload.borrowerId || payload.principalAmount <= 0) {
    return { error: "Invalid loan details provided." };
  }

  // 3. Insert Loan record
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      user_id: user.id,
      borrower_id: payload.borrowerId,
      principal_amount: payload.principalAmount,
      release_date: payload.releaseDate,
      loan_category: payload.loanCategory,
      term_type: payload.termType,
      total_interest_expected: payload.totalInterestExpected,
      rc_allocation: payload.rcAllocation,
      edith_allocation: payload.edithAllocation,
      status: "Active",
    })
    .select()
    .single();

  if (loanError) {
    console.error("Supabase Loan Insert Error:", loanError);
    return { error: "Failed to create loan record. " + loanError.message };
  }

  // 4. Insert Schedules
  const scheduleInserts = payload.schedules.map((sch) => ({
    loan_id: loan.id,
    expected_date: sch.expectedDate,
    expected_amount: sch.expectedAmount,
  }));

  const { error: scheduleError } = await supabase
    .from("schedules")
    .insert(scheduleInserts);

  if (scheduleError) {
    console.error("Supabase Schedule Insert Error:", scheduleError);
    // In a real production system, if this fails, we might want to rollback the loan insert (transaction).
    // For now, we return the error.
    return {
      error:
        "Loan created, but failed to generate schedule. " +
        scheduleError.message,
    };
  }

  // 5. Revalidate cache
  revalidatePath("/borrowers");
  revalidatePath("/loans");
  revalidatePath(`/borrowers/${payload.borrowerId}`);

  return { success: true, loanId: loan.id };
}

export async function markLoanAsPaid(loanId: string) {
  const supabase = await createClient();

  // Verify User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a loan." };
  }

  // Update loan status
  const { error } = await supabase
    .from("loans")
    .update({ status: "Paid" })
    .eq("id", loanId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Supabase Loan Update Error:", error);
    return { error: "Failed to update loan status. " + error.message };
  }

  revalidatePath("/loans");
  revalidatePath(`/loans/${loanId}`);

  return { success: true };
}

type LogPaymentPayload = {
  loanId: string;
  amountPaid: number;
  datePaid: string;
  paymentMethod?: string;
  notes?: string;
};

export async function logPayment(payload: LogPaymentPayload) {
  const supabase = await createClient();

  // 1. Verify User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to log a payment." };
  }

  // 2. Validate payload
  if (!payload.loanId || payload.amountPaid <= 0 || !payload.datePaid) {
    return { error: "Invalid payment details provided." };
  }

  // 3. Insert Payment record
  const { error: paymentError } = await supabase.from("payments").insert({
    loan_id: payload.loanId,
    amount_paid: payload.amountPaid,
    date_paid: payload.datePaid,
    payment_method: payload.paymentMethod || null,
    notes: payload.notes || null,
  });

  if (paymentError) {
    console.error("Supabase Payment Insert Error:", paymentError);
    return { error: "Failed to log payment. " + paymentError.message };
  }

  // 4. Check if loan is fully paid
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("borrower_id, principal_amount, total_interest_expected, status")
    .eq("id", payload.loanId)
    .single();

  if (loan && !loanError && loan.status === "Active") {
    // Fetch total paid
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount_paid")
      .eq("loan_id", payload.loanId);

    if (!paymentsError && payments) {
      const totalPaid = payments.reduce(
        (sum, p) => sum + Number(p.amount_paid),
        0,
      );
      const totalRequired =
        Number(loan.principal_amount) + Number(loan.total_interest_expected);

      if (totalPaid >= totalRequired) {
        // Mark as paid
        await supabase
          .from("loans")
          .update({ status: "Paid" })
          .eq("id", payload.loanId)
          .eq("user_id", user.id);
      }
    }
  }

  // 5. Revalidate cache
  revalidatePath("/loans");
  revalidatePath(`/loans/${payload.loanId}`);
  if (loan?.borrower_id) {
    revalidatePath(`/borrowers/${loan.borrower_id}`);
  }

  return { success: true };
}

export async function deleteLoan(loanId: string) {
  const supabase = await createClient();

  // Verify User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to delete a loan." };
  }

  // Delete loan
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", loanId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Supabase Loan Delete Error:", error);
    return { error: "Failed to delete loan. " + error.message };
  }

  revalidatePath("/loans");
  revalidatePath("/borrowers");

  return { success: true };
}
