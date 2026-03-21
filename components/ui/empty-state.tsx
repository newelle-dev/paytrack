import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-ivory-cream rounded-xl bg-white shadow-sm w-full">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory-cream mb-4">
        <Icon className="h-8 w-8 text-gold" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-text-primary tracking-tight">
        {title}
      </h3>
      <p className="mt-2 mb-6 text-sm text-text-secondary max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-gold hover:bg-gold-dark text-white border-0 shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
