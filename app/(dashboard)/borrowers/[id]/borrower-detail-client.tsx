"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Loan, Payment } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteBorrower,
  updateBorrower,
} from "@/app/(dashboard)/borrowers/actions";

interface BorrowerData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  loans: Loan[];
}

interface BorrowerDetailClientProps {
  initialData: BorrowerData;
}

export function BorrowerDetailClient({
  initialData,
}: BorrowerDetailClientProps) {
  const router = useRouter();
  const borrower = initialData;
  const [activeTab, setActiveTab] = useState<"loans" | "payments">("loans");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract all payments from all loans for the payments tab
  const allPayments = borrower.loans
    .flatMap((loan: Loan) =>
      (loan.payments || []).map((p: Payment) => ({
        ...p,
        loan_id: loan.id,
        loan_category: loan.loan_category,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime(),
    );

  // Calculate aggregates
  const activeLoans = borrower.loans.filter((l) => l.status === "Active");
  const totalPrincipal = activeLoans.reduce(
    (sum, l) => sum + Number(l.principal_amount),
    0,
  );

  const totalRemaining = activeLoans.reduce((sum, l) => {
    const totalReq =
      Number(l.principal_amount) + Number(l.total_interest_expected);
    const paid =
      l.payments?.reduce(
        (s: number, p: Payment) => s + Number(p.amount_paid),
        0,
      ) || 0;
    return sum + Math.max(0, totalReq - paid);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  async function handleDelete() {
    if (
      confirm(
        "Are you sure you want to delete this borrower? All their loans and payments will be removed.",
      )
    ) {
      const formData = new FormData();
      formData.append("id", borrower.id);
      await deleteBorrower(formData);
      router.push("/borrowers");
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("id", borrower.id);

    try {
      const res = await updateBorrower(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsEditModalOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/borrowers")}
          className="h-8 w-8 text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-text-primary flex-1">
          {borrower.first_name}{borrower.last_name ? ` ${borrower.last_name}` : ""}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <Card className="col-span-1 p-6 flex flex-col gap-4 border border-ivory-cream bg-white shadow-sm rounded-lg">
          <h2 className="text-lg font-medium text-text-primary">
            Contact Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Mail className="h-4 w-4 mt-0.5 text-text-secondary" />
              <div>
                <p className="font-medium text-text-primary">Email Address</p>
                <p className="text-text-secondary">
                  {borrower.email || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Phone className="h-4 w-4 mt-0.5 text-text-secondary" />
              <div>
                <p className="font-medium text-text-primary">Phone Number</p>
                <p className="text-text-secondary">
                  {borrower.phone_number || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm border-t border-ivory-cream pt-3 mt-3">
              <Calendar className="h-4 w-4 mt-0.5 text-text-secondary" />
              <div>
                <p className="font-medium text-text-primary">Added On</p>
                <p className="text-text-secondary">
                  {format(new Date(borrower.created_at), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Aggregate Stats Card */}
        <Card className="col-span-1 p-6 flex flex-col gap-4 border border-ivory-cream bg-ivory-light shadow-sm rounded-lg">
          <h2 className="text-lg font-medium text-text-primary">
            Loan Totals (Active)
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-mono font-bold text-text-primary">
                {formatCurrency(totalPrincipal)}
              </p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">
                Total Principal
              </p>
            </div>
            <div className="pt-2 border-t border-ivory-cream">
              <p className="text-2xl font-mono font-bold text-gold">
                {formatCurrency(totalRemaining)}
              </p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">
                Total Remaining Balance
              </p>
            </div>
          </div>
        </Card>

        {/* Tabbed Content */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <div className="flex border-b border-ivory-cream">
            <button
              className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "loans" ? "border-b-2 border-gold text-gold" : "text-text-secondary hover:text-text-primary"}`}
              onClick={() => setActiveTab("loans")}
            >
              Loans ({borrower.loans.length})
            </button>
            <button
              className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "payments" ? "border-b-2 border-gold text-gold" : "text-text-secondary hover:text-text-primary"}`}
              onClick={() => setActiveTab("payments")}
            >
              Payment History ({allPayments.length})
            </button>
          </div>

          <Card className="p-0 border border-ivory-cream bg-white shadow-sm overflow-hidden rounded-lg">
            {activeTab === "loans" && (
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrower.loans.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-text-secondary"
                      >
                        No loans found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    borrower.loans.map((loan) => {
                      const totalReq =
                        Number(loan.principal_amount) +
                        Number(loan.total_interest_expected);
                        const paid =
                          loan.payments?.reduce(
                            (s: number, p: Payment) =>
                              s + Number(p.amount_paid),
                            0,
                          ) || 0;
                      const remaining = Math.max(0, totalReq - paid);

                      return (
                        <TableRow
                          key={loan.id}
                          className="cursor-pointer hover:bg-ivory-light/50"
                          onClick={() => router.push(`/loans/${loan.id}`)}
                        >
                          <TableCell className="font-medium text-text-primary">
                            {loan.loan_category}
                          </TableCell>
                          <TableCell className="tabular-nums font-mono">
                            {formatCurrency(loan.principal_amount)}
                          </TableCell>
                          <TableCell className="tabular-nums font-mono font-semibold text-text-primary">
                            {formatCurrency(remaining)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="default"
                              className={
                                loan.status === "Active"
                                  ? "bg-gold text-white"
                                  : "bg-green-600 text-white"
                              }
                            >
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">
                            {format(new Date(loan.created_at), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "payments" && (
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Loan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-text-secondary"
                      >
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    allPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-text-secondary">
                          {format(new Date(payment.date_paid), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="tabular-nums font-medium text-text-primary">
                          ₱{payment.amount_paid.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.payment_method || "-"}</TableCell>
                        <TableCell className="text-xs text-text-secondary">
                          {payment.loan_category}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Borrower"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="first_name"
                className="text-xs font-medium text-text-secondary"
              >
                First Name *
              </label>
              <Input
                id="first_name"
                name="first_name"
                required
                defaultValue={borrower.first_name}
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="last_name"
                className="text-xs font-medium text-text-secondary"
              >
                Last Name (Optional)
              </label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={borrower.last_name || ""}
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-text-secondary"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={borrower.email || ""}
              disabled={pending}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone_number"
              className="text-xs font-medium text-text-secondary"
            >
              Phone Number
            </label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              defaultValue={borrower.phone_number || ""}
              disabled={pending}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
