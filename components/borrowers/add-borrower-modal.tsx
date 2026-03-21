"use client"

import * as React from "react"
import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createBorrower } from "@/app/(dashboard)/borrowers/actions"

interface AddBorrowerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBorrowerModal({ isOpen, onClose }: AddBorrowerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createBorrower(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Borrower">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="first_name" className="text-xs font-medium text-text-secondary">First Name *</label>
            <Input id="first_name" name="first_name" required placeholder="John" disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="last_name" className="text-xs font-medium text-text-secondary">Last Name *</label>
            <Input id="last_name" name="last_name" required placeholder="Doe" disabled={pending} />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-text-secondary">Email Address</label>
          <Input id="email" name="email" type="email" placeholder="johndoe@example.com" disabled={pending} />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="phone_number" className="text-xs font-medium text-text-secondary">Phone Number</label>
          <Input id="phone_number" name="phone_number" type="tel" placeholder="+63 (908) 754-7562" disabled={pending} />
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Borrower"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
