import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { LoanDetailClient } from "./loan-detail-client";
import { type Loan } from "@/lib/types";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: loan, error } = await supabase
    .from("loans")
    .select(
      `
      *,
      borrower:borrower_id (
        id,
        first_name,
        last_name,
        email,
        phone_number
      ),
      schedules (
        id,
        expected_date,
        expected_amount,
        created_at
      ),
      payments (
        id,
        amount_paid,
        date_paid,
        payment_method,
        notes,
        created_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !loan) {
    console.error("Error fetching loan detail:", error);
    notFound();
  }

  // Calculate generic remaining balance
  const totalExpected =
    Number(loan.principal_amount) + Number(loan.total_interest_expected);
  const totalPaid =
    loan.payments?.reduce(
      (sum: number, p: { amount_paid: string | number }) =>
        sum + Number(p.amount_paid),
      0,
    ) || 0;
  const remainingBalance = Math.max(0, totalExpected - totalPaid);

  const formattedLoan: Loan = {
    ...loan,
    remaining_balance: remainingBalance,
    // Ensure schedule is ordered by date
    schedules:
      loan.schedules?.sort(
        (a: { expected_date: string }, b: { expected_date: string }) =>
          new Date(a.expected_date).getTime() -
          new Date(b.expected_date).getTime(),
      ) || [],
    payments:
      loan.payments?.sort(
        (
          a: { date_paid: string; created_at: string },
          b: { date_paid: string; created_at: string },
        ) => {
          const dateDiff =
            new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime();
          if (dateDiff === 0) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          return dateDiff;
        },
      ) || [],
    borrower: Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower,
  };

  return (
    <div className="flex flex-col gap-6">
      <LoanDetailClient initialData={formattedLoan} />
    </div>
  );
}
