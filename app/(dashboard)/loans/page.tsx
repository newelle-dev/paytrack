import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoanListClient } from "./loan-list-client"


export default async function LoansPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch loans with borrowers and schedules
  const { data: loans, error } = await supabase
    .from("loans")
    .select(`
      id,
      principal_amount,
      loan_category,
      status,
      release_date,
      created_at,
      borrowers (
        id,
        first_name,
        last_name
      ),
      schedules (
        expected_amount
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching loans:", error)
  }

  const formattedLoans = (loans || []).map(loan => {
    // For V1 (before payments phase), remaining balance is just the sum of expected schedules
    const remainingBalance = loan.schedules?.reduce((sum, sch) => sum + Number(sch.expected_amount), 0) || 0;
    
    return {
      id: loan.id,
      principal_amount: loan.principal_amount,
      loan_category: loan.loan_category,
      status: loan.status,
      release_date: loan.release_date,
      created_at: loan.created_at,
      borrower: loan.borrowers,
      remaining_balance: remainingBalance
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Loans</h1>
          <p className="text-sm text-text-secondary mt-1">
            View and manage all active and paid loans.
          </p>
        </div>
      </div>

      <LoanListClient initialLoans={formattedLoans} />
    </div>
  )
}
