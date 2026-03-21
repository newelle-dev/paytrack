"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { format, parseISO } from "date-fns"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { markLoanAsPaid } from "@/app/(dashboard)/loans/actions"
import { PaymentModal } from "@/components/payment-modal"
import { ReceiptText, History } from "lucide-react"

interface Borrower {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone_number: string | null
}

interface Schedule {
  id: string
  expected_date: string
  expected_amount: number
  created_at: string
}

interface Payment {
  id: string
  amount_paid: number
  date_paid: string
  payment_method: string | null
  notes: string | null
  created_at: string
}

interface Loan {
  id: string
  principal_amount: number
  loan_category: string
  status: string
  term_type: string
  release_date: string
  created_at: string
  total_interest_expected: number
  rc_allocation: number
  edith_allocation: number
  borrower: Borrower
  schedules: Schedule[]
  payments: Payment[]
  remaining_balance: number
}

interface LoanDetailClientProps {
  initialData: Loan
}

export function LoanDetailClient({ initialData }: LoanDetailClientProps) {
  const router = useRouter()
  const loan = initialData
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase()
    if (s === "active") return "success"
    if (s === "defaulted") return "error"
    return "default" // paid
  }

  const handleMarkAsPaid = async () => {
    if (!confirm("Are you sure you want to mark this loan as fully paid?")) return
    
    setIsMarkingPaid(true)
    const result = await markLoanAsPaid(loan.id)
    if (result?.error) {
      alert("Error: " + result.error)
      setIsMarkingPaid(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/loans")}
            className="h-8 w-8 text-text-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Loan Details
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {loan.borrower?.first_name} {loan.borrower?.last_name} &bull; {loan.loan_category}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(loan.status)} className="px-3 py-1 text-sm">
            {loan.status}
          </Badge>
          
          {loan.status.toLowerCase() === "active" && (
            <>
              <Button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-gold hover:bg-gold/90 text-white border-0"
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                Log Payment
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleMarkAsPaid} 
                disabled={isMarkingPaid}
                className="border-ivory-cream text-text-secondary hover:bg-ivory-cream/20"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isMarkingPaid ? "Updating..." : "Mark as Paid"}
              </Button>
            </>
          )}
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loanId={loan.id}
        borrowerName={`${loan.borrower?.first_name} ${loan.borrower?.last_name}`}
        remainingBalance={loan.remaining_balance}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Loan Summary & Borrower Info */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              <div>
                <p className="text-3xl font-mono font-semibold text-text-primary">
                  {formatCurrency(loan.principal_amount)}
                </p>
                <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">
                  Principal Amount
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-mono text-text-primary">{formatCurrency(loan.remaining_balance)}</p>
                  <p className="text-xs text-text-secondary">Remaining Bal.</p>
                </div>
                <div>
                  <p className="font-mono text-text-primary">{formatCurrency(loan.total_interest_expected)}</p>
                  <p className="text-xs text-text-secondary">Expected Interest</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-ivory-cream">
                <div>
                  <p className="font-mono text-text-primary">{loan.term_type}</p>
                  <p className="text-xs text-text-secondary">Term Type</p>
                </div>
                <div>
                  <p className="font-mono text-text-primary">
                    {loan.release_date ? format(parseISO(loan.release_date), "MMM d, yyyy") : "-"}
                  </p>
                  <p className="text-xs text-text-secondary">Release Date</p>
                </div>
              </div>
              
               <div className="grid grid-cols-2 gap-4 pt-2 border-t border-ivory-cream">
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="font-mono text-text-primary">{loan.rc_allocation}%</p>
                    <p className="text-[10px] text-text-secondary whitespace-nowrap">
                      ({formatCurrency((loan.rc_allocation / 100) * loan.total_interest_expected)})
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary">RC Allocation</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="font-mono text-text-primary">{loan.edith_allocation}%</p>
                    <p className="text-[10px] text-text-secondary whitespace-nowrap">
                      ({formatCurrency((loan.edith_allocation / 100) * loan.total_interest_expected)})
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary">EDITH Allocation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Borrower Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
              <p className="font-medium text-text-primary">
                {loan.borrower?.first_name} {loan.borrower?.last_name}
              </p>
              {loan.borrower?.email && (
                <p className="text-sm text-text-secondary">{loan.borrower.email}</p>
              )}
              {loan.borrower?.phone_number && (
                <p className="text-sm text-text-secondary">{loan.borrower.phone_number}</p>
              )}
              <Button
                variant="outline"
                className="mt-2 w-full text-xs"
                onClick={() => router.push(`/borrowers/${loan.borrower?.id}`)}
              >
                View Borrower Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Schedule */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <CardTitle className="text-lg text-text-primary">
                Payment Schedule
              </CardTitle>
              <CardDescription>
                Expected collection dates and amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead className="text-right pr-6">Expected Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-text-secondary">
                        No schedule available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loan.schedules.map((schedule, idx) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="pl-6 text-text-primary">
                          <span className="text-text-secondary mr-3 text-xs">#{idx + 1}</span>
                          {format(parseISO(schedule.expected_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-mono font-medium text-text-primary">
                          {formatCurrency(schedule.expected_amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment History Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3 border-b border-ivory-cream">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                    <History className="h-5 w-5 text-gold" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    History of payments received for this loan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right pr-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-text-secondary">
                        No payments logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loan.payments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <TableRow className="border-b-0">
                          <TableCell className="pl-6 text-text-primary font-medium">
                            {format(parseISO(payment.date_paid), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-text-secondary text-sm">
                            {payment.payment_method || "-"}
                          </TableCell>
                          <TableCell className="text-right pr-6 font-mono font-bold text-success">
                            + {formatCurrency(payment.amount_paid)}
                          </TableCell>
                        </TableRow>
                        {payment.notes && (
                          <TableRow className="border-t-0 hover:bg-transparent">
                            <TableCell colSpan={3} className="pl-6 pb-3 pt-0 text-xs text-text-secondary italic">
                              Note: {payment.notes}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
