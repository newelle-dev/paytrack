"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBorrower(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string
  let email = formData.get("email") as string | null
  let phone = formData.get("phone_number") as string | null

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required")
  }

  // Convert empty strings to null for optional fields to avoid unique constraint issues
  if (email?.trim() === "") email = null
  if (phone?.trim() === "") phone = null

  const { data, error } = await supabase
    .from("borrowers")
    .insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phone,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating borrower:", error)
    return { error: error.message }
  }

  revalidatePath("/borrowers")
  return { data }
}

export async function deleteBorrower(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const id = formData.get("id") as string
  if (!id) {
    throw new Error("Borrower ID is required")
  }

  const { error } = await supabase
    .from("borrowers")
    .delete()
    .eq("id", id)
    // ensure RLS by adding user_id, though RLS already protects this
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting borrower:", error)
    return { error: error.message }
  }

  revalidatePath("/borrowers")
  return { success: true }
}

export async function updateBorrower(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const id = formData.get("id") as string
  if (!id) {
    throw new Error("Borrower ID is required")
  }

  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string
  let email = formData.get("email") as string | null
  let phone = formData.get("phone_number") as string | null

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required")
  }

  // Convert empty strings to null for optional fields
  if (email?.trim() === "") email = null
  if (phone?.trim() === "") phone = null

  const { error } = await supabase
    .from("borrowers")
    .update({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phone,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating borrower:", error)
    return { error: error.message }
  }

  revalidatePath("/borrowers")
  revalidatePath(`/borrowers/${id}`)
  return { success: true }
}
