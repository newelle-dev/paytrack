import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function LoansLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Loans
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            View and manage all active and paid loans.
          </p>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-[130px]" />
            <Skeleton className="h-10 w-full sm:w-[140px]" />
          </div>
        </div>

        <TableSkeleton
          columns={[
            "Borrower",
            "Category",
            "Principal",
            "Remaining",
            "Release Date",
            "Status",
            "Actions",
          ]}
        />
      </div>
    </div>
  );
}
