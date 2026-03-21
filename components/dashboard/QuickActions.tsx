import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ReceiptText, UserPlus, ArrowRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "New Loan",
      description: "Create a new interest-bearing loan",
      href: "/loans/new",
      icon: <PlusCircle className="h-5 w-5" />,
      color: "bg-gold text-white",
    },
    {
      title: "Log Payment",
      description: "Record a payment from a borrower",
      href: "/loans", // Redirect to loans list for now to select a loan
      icon: <ReceiptText className="h-5 w-5" />,
      color: "border-gold text-gold",
    },
    {
      title: "Add Borrower",
      description: "Register a new borrower in the system",
      href: "/borrowers",
      icon: <UserPlus className="h-5 w-5" />,
      color: "bg-ivory-cream text-text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Card key={action.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${action.color}`}
            >
              {action.icon}
            </div>
            <CardTitle className="text-lg">{action.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              {action.description}
            </p>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-between group p-0 hover:bg-transparent text-gold font-semibold"
            >
              <Link href={action.href}>
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
