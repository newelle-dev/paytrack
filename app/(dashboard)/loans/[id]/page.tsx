import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { LoanDetailClient } from "./loan-detail-client"

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: loan, error } = await supabase
    .from("loans")
    .select(`
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
      )
    `)
    .eq("id", id)
    .single()

  if (error || !loan) {
    console.error("Error fetching loan detail:", error)
    notFound()
  }

  // Calculate generic remaining balance (since phase 6 handles payments, we just sum up expected_amount as a fallback for now)
  const remainingBalance = loan.schedules?.reduce((sum: number, sch: { expected_amount: string | number }) => sum + Number(sch.expected_amount), 0) || 0;
  
  const formattedLoan = {
    ...loan,
    remaining_balance: remainingBalance,
    // Ensure schedule is ordered by date
    schedules: loan.schedules?.sort((a: { expected_date: string }, b: { expected_date: string }) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()) || [],
    borrower: Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower
  }

  return (
    <div className="flex flex-col gap-6">
      <LoanDetailClient initialData={formattedLoan} />
    </div>
  )
}
