import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { BorrowerDetailClient } from "./borrower-detail-client"

export default async function BorrowerDetailPage({
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

  const { data: borrower, error } = await supabase
    .from("borrowers")
    .select(`
      *,
      loans (
        id,
        principal_amount,
        loan_category,
        term_type,
        status,
        created_at,
        total_interest_expected,
        rc_allocation,
        edith_allocation,
        payments (
          id,
          amount_paid,
          date_paid,
          payment_method,
          notes
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !borrower) {
    console.error("Error fetching borrower detail:", error)
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <BorrowerDetailClient initialData={borrower} />
    </div>
  )
}
