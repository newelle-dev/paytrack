import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoanListClient } from "./loan-list-client"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"


export default async function LoansPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch loans with borrowers, schedules, and payments
  const { data: loans, error } = await supabase
    .from("loans")
    .select(`
      id,
      principal_amount,
      total_interest_expected,
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
      ),
      payments (
        amount_paid
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching loans:", error)
  }

  const formattedLoans = (loans || []).map(loan => {
    // Calculate accurate remaining balance: Total (Principal + Interest) - Amount Paid
    const totalExpected = Number(loan.principal_amount) + Number(loan.total_interest_expected)
    const paid = loan.payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0
    const remainingBalance = Math.max(0, totalExpected - paid);
    
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Loans</h1>
          <p className="text-sm text-text-secondary mt-1">
            View and manage all active and paid loans.
          </p>
        </div>

        <Link 
          href="/loans/new" 
          className={cn(buttonVariants(), "bg-gold hover:bg-gold-dark text-white border-0")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Loan
        </Link>
      </div>

      <LoanListClient initialLoans={formattedLoans} />
    </div>
  )
}
