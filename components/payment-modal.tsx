"use client"

import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logPayment } from "@/app/(dashboard)/loans/actions"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  loanId: string
  borrowerName: string
  remainingBalance: number
}

export function PaymentModal({ isOpen, onClose, loanId, borrowerName, remainingBalance }: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number(formData.get("amountPaid"))
    const date = formData.get("datePaid") as string
    const method = formData.get("paymentMethod") as string
    const notes = formData.get("notes") as string

    if (amount <= 0) {
      setError("Amount must be greater than 0.")
      setIsSubmitting(false)
      return
    }
    
    if (amount > remainingBalance) {
      if (!confirm(`You are logging a payment of ${amount} which is more than the remaining balance of ${remainingBalance}. Are you sure?`)) {
        setIsSubmitting(false)
        return
      }
    }

    const res = await logPayment({
      loanId,
      amountPaid: amount,
      datePaid: date,
      paymentMethod: method,
      notes: notes,
    })

    if (res?.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      setIsSubmitting(false)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Payment for ${borrowerName}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="amountPaid">Amount Paid (PHP)</Label>
          <Input 
            id="amountPaid" 
            name="amountPaid" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            required 
            defaultValue={remainingBalance > 0 ? remainingBalance : ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="datePaid">Payment Date</Label>
          <Input 
            id="datePaid" 
            name="datePaid" 
            type="date" 
            required 
            defaultValue={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select 
            id="paymentMethod" 
            name="paymentMethod" 
            className="flex h-10 w-full rounded-md border border-ivory-cream bg-white px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="GCash">GCash</option>
            <option value="Check">Check</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input 
            id="notes" 
            name="notes" 
            type="text" 
            placeholder="e.g. Partial payment" 
          />
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-ivory-cream">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold/90 text-white border-0">
            {isSubmitting ? "Saving..." : "Log Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
