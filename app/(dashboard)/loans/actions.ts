"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ScheduleInput } from "@/lib/utils/loanMath"

type CreateLoanPayload = {
  borrowerId: string
  principalAmount: number
  releaseDate: string
  loanCategory: "Small" | "Big"
  termType: string
  totalInterestExpected: number
  rcAllocation: number
  edithAllocation: number
  schedules: ScheduleInput[]
}

export async function createLoan(payload: CreateLoanPayload) {
  const supabase = await createClient()

  // 1. Verify User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to create a loan." }
  }

  // 2. Validate payload
  if (!payload.borrowerId || payload.principalAmount <= 0) {
    return { error: "Invalid loan details provided." }
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
    .single()

  if (loanError) {
    console.error("Supabase Loan Insert Error:", loanError)
    return { error: "Failed to create loan record. " + loanError.message }
  }

  // 4. Insert Schedules
  const scheduleInserts = payload.schedules.map((sch) => ({
    loan_id: loan.id,
    expected_date: sch.expectedDate,
    expected_amount: sch.expectedAmount,
  }))

  const { error: scheduleError } = await supabase
    .from("schedules")
    .insert(scheduleInserts)

  if (scheduleError) {
    console.error("Supabase Schedule Insert Error:", scheduleError)
    // In a real production system, if this fails, we might want to rollback the loan insert (transaction).
    // For now, we return the error.
    return { error: "Loan created, but failed to generate schedule. " + scheduleError.message }
  }

  // 5. Revalidate cache
  revalidatePath("/borrowers")
  revalidatePath("/loans")
  revalidatePath(`/borrowers/${payload.borrowerId}`)

  return { success: true, loanId: loan.id }
}

export async function markLoanAsPaid(loanId: string) {
  const supabase = await createClient()

  // Verify User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a loan." }
  }

  // Update loan status
  const { error } = await supabase
    .from("loans")
    .update({ status: "Paid" })
    .eq("id", loanId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Supabase Loan Update Error:", error)
    return { error: "Failed to update loan status. " + error.message }
  }

  revalidatePath("/loans")
  revalidatePath(`/loans/${loanId}`)

  return { success: true }
}
