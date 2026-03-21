import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-ivory-cream text-text-primary hover:bg-ivory",
        success:
          "border-transparent bg-success/10 text-success hover:bg-success/20",
        error:
          "border-transparent bg-error/10 text-error hover:bg-error/20",
        warning:
          "border-transparent bg-warning/10 text-warning hover:bg-warning/20",
        outline: "text-text-primary border-ivory-cream",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
