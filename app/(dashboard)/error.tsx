"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex w-full h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <AlertCircle className="h-8 w-8 text-error" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-text-secondary mt-1 max-w-sm">
          We encountered an error loading this page. Please try again.
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline" className="mt-4">
        Try again
      </Button>
    </div>
  );
}
