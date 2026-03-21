"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Trash2,
  UserPlus,
  Users2,
} from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddBorrowerModal } from "@/components/borrowers/add-borrower-modal";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { deleteBorrower } from "@/app/(dashboard)/borrowers/actions";
import { EmptyState } from "@/components/ui/empty-state";

interface Borrower {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  active_loans_count: number;
}

interface BorrowersClientProps {
  initialBorrowers: Borrower[];
}

export function BorrowersClient({ initialBorrowers }: BorrowersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Basic search filter (client-side)
  const filteredBorrowers = useMemo(() => {
    return initialBorrowers.filter((b) => {
      const q = search.toLowerCase();
      const fullName = `${b.first_name}${b.last_name ? ` ${b.last_name}` : ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone_number && b.phone_number.includes(q))
      );
    });
  }, [initialBorrowers, search]);

  const [borrowerToDelete, setBorrowerToDelete] = useState<string | null>(null);

  async function confirmDelete() {
    if (!borrowerToDelete) return;
    const formData = new FormData();
    formData.append("id", borrowerToDelete);
    await deleteBorrower(formData);
    setBorrowerToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Borrower Directory
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your clients, view their loan history, and update contact
            information.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gold hover:bg-gold/90 text-white border-0"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Borrower
        </Button>
      </div>

      {initialBorrowers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Users2}
            title="No borrowers yet"
            description="Get started by adding your first borrower to manage their contact details and loans."
            actionLabel="Add Borrower"
            onAction={() => setIsAddModalOpen(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Search and Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Search borrowers..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Main Table Content */}
          <div className="rounded-lg border border-ivory-cream bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-ivory-light">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Active Loans</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-text-secondary"
                      >
                        No borrowers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBorrowers.map((borrower) => (
                      <TableRow 
                        key={borrower.id} 
                        className="group cursor-pointer hover:bg-ivory-cream/50 transition-colors"
                        onClick={() => router.push(`/borrowers/${borrower.id}`)}
                      >
                        <TableCell className="font-medium text-text-primary">
                          {borrower.first_name}{borrower.last_name ? ` ${borrower.last_name}` : ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs text-text-secondary space-y-0.5">
                            {borrower.email && <span>{borrower.email}</span>}
                            {borrower.phone_number && (
                              <span>{borrower.phone_number}</span>
                            )}
                            {!borrower.email && !borrower.phone_number && (
                              <span>No contact info</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {borrower.active_loans_count > 0 ? (
                            <Badge
                              variant="default"
                              className="bg-gold text-white font-mono rounded"
                            >
                              {borrower.active_loans_count}
                            </Badge>
                          ) : (
                            <span className="text-text-secondary">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-text-secondary">
                          {format(new Date(borrower.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBorrowerToDelete(borrower.id);
                              }}
                              className="h-8 w-8 text-text-secondary hover:text-red-500 transition-colors"
                              title="Delete Borrower"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <AddBorrowerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={!!borrowerToDelete}
        onClose={() => setBorrowerToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Borrower"
        description="Are you sure you want to delete this borrower? All their loans and payments will be removed."
      />
    </div>
  );
}
