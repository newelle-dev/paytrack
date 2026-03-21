import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LoanWizard } from "@/components/loans/wizard/loan-wizard"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "New Loan | PayTrack",
  description: "Create a new loan agreement"
}

export default async function NewLoanPage() {
  const supabase = await createClient()

  // Protect route
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch borrowers to pass into wizard
  const { data: borrowers, error } = await supabase
    .from("borrowers")
    .select("id, first_name, last_name, email")
    .order("last_name", { ascending: true })

  if (error) {
    console.error("Error fetching borrowers for wizard:", error)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link 
          href="/loans" 
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-text-secondary")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Create New Loan</h1>
          <p className="text-sm text-text-secondary mt-1">
            Set up a new loan agreement and configure the repayment schedule.
          </p>
        </div>
      </div>

      <div className="w-full">
        <LoanWizard initialBorrowers={borrowers || []} />
      </div>
    </div>
  )
}
