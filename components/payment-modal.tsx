"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { logPayment } from "@/app/(dashboard)/loans/actions";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  borrowerName: string;
  remainingBalance: number;
  suggestedAmount?: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  loanId,
  borrowerName,
  remainingBalance,
  suggestedAmount,
}: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amountPaid"));
    const date = formData.get("datePaid") as string;
    const method = formData.get("paymentMethod") as string;
    const notes = formData.get("notes") as string;

    if (amount <= 0) {
      setError("Amount must be greater than 0.");
      setIsSubmitting(false);
      return;
    }

    if (amount > remainingBalance) {
      if (
        !confirm(
          `The payment amount (${formatCurrency(amount)}) exceeds the remaining balance (${formatCurrency(remainingBalance)}). Are you sure you want to proceed?`,
        )
      ) {
        setIsSubmitting(false);
        return;
      }
    }

    const res = await logPayment({
      loanId,
      amountPaid: amount,
      datePaid: date,
      paymentMethod: method,
      notes: notes,
    });

    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Payment for ${borrowerName}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amountPaid">Amount Paid (PHP)</Label>
            <Input
              id="amountPaid"
              name="amountPaid"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              defaultValue={suggestedAmount ?? (remainingBalance > 0 ? remainingBalance : "")}
              className="font-mono"
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
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue="Cash"
            required
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="GCash">GCash</option>
            <option value="Check">Check</option>
            <option value="Other">Other</option>
          </Select>
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

        <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-ivory-cream">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-ivory-cream text-text-secondary hover:bg-ivory-cream/20"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold hover:bg-gold/90 text-white border-0 px-8"
          >
            {isSubmitting ? "Saving..." : "Log Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
