import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BorrowersClient } from "./borrowers-client"

export default async function BorrowersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch borrowers
  const { data: borrowers, error } = await supabase
    .from("borrowers")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      created_at,
      loans ( count )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching borrowers:", error)
  }

  // Map the join count correctly
  const formattedBorrowers = (borrowers || []).map(b => ({
    id: b.id,
    first_name: b.first_name,
    last_name: b.last_name,
    email: b.email,
    phone_number: b.phone_number,
    created_at: b.created_at,
    active_loans_count: b.loans?.[0]?.count || 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Borrower Directory</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your clients, view their loan history, and update contact information.
          </p>
        </div>
      </div>

      <BorrowersClient initialBorrowers={formattedBorrowers} />
    </div>
  )
}
