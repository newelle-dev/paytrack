import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex w-full h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-gold" />
      <p className="text-sm font-medium text-text-secondary">
        Loading your dashboard...
      </p>
    </div>
  );
}
