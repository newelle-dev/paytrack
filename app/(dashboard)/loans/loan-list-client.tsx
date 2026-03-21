"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye } from "lucide-react"
import { format, parseISO } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select
} from "@/components/ui/select"

interface Borrower {
  id: string
  first_name: string
  last_name: string
}

interface Loan {
  id: string
  principal_amount: number
  loan_category: string
  status: string
  release_date: string
  created_at: string
  borrower: Borrower | Borrower[] | null
  remaining_balance: number
}

interface LoanListClientProps {
  initialLoans: Loan[]
}

export function LoanListClient({ initialLoans }: LoanListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  
  const filteredLoans = useMemo(() => {
    return initialLoans.filter(loan => {
      const b = Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower
      
      const q = search.toLowerCase()
      const borrowerName = b ? `${b.first_name} ${b.last_name}`.toLowerCase() : ""
      
      const matchesSearch = borrowerName.includes(q)
      const matchesStatus = statusFilter === "all" || loan.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesCategory = categoryFilter === "all" || loan.loan_category.toLowerCase() === categoryFilter.toLowerCase()
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [initialLoans, search, statusFilter, categoryFilter])

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search by borrower name..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[130px] bg-white text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="defaulted">Defaulted</option>
          </Select>
          
          <Select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-[140px] bg-white text-text-primary"
          >
            <option value="all">All Categories</option>
            <option value="Small">Small (&le;5k)</option>
            <option value="Big">Big (&gt;5k)</option>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-ivory-cream bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-ivory-light">
              <TableRow>
                <TableHead className="whitespace-nowrap">Borrower</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right whitespace-nowrap">Principal</TableHead>
                <TableHead className="text-right whitespace-nowrap">Remaining</TableHead>
                <TableHead className="whitespace-nowrap">Release Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-text-secondary">
                    No loans found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => {
                  const b = Array.isArray(loan.borrower) ? loan.borrower[0] : loan.borrower;
                  return (
                    <TableRow key={loan.id} className="group">
                      <TableCell className="font-medium text-text-primary whitespace-nowrap">
                        {b ? `${b.first_name} ${b.last_name}` : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal bg-ivory-light/50 border-ivory-cream text-text-secondary">
                          {loan.loan_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-text-secondary whitespace-nowrap">
                        {formatCurrency(loan.principal_amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-text-primary whitespace-nowrap">
                        {formatCurrency(loan.remaining_balance)}
                      </TableCell>
                      <TableCell className="text-text-secondary whitespace-nowrap text-sm">
                        {loan.release_date ? format(parseISO(loan.release_date), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(loan.status)}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/loans/${loan.id}`)}
                          className="h-8 w-8 text-text-secondary hover:text-gold transition-colors"
                          title="View Loan Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
