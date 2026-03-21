import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Banknote, Users, UserCheck } from "lucide-react";

interface SummaryCardsProps {
  totalActiveCapital: number;
  totalInterestExpected: number;
  rcTotal: number;
  edithTotal: number;
}

export function SummaryCards({
  totalActiveCapital,
  totalInterestExpected,
  rcTotal,
  edithTotal,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Active Capital",
      value: formatCurrency(totalActiveCapital),
      icon: <Wallet className="h-4 w-4 text-gold" />,
      description: "Total principal in active loans",
    },
    {
      title: "Expected Interest",
      value: formatCurrency(totalInterestExpected),
      icon: <Banknote className="h-4 w-4 text-gold" />,
      description: "Total interest from active loans",
    },
    {
      title: "RC Allocation",
      value: formatCurrency(rcTotal),
      icon: <Users className="h-4 w-4 text-gold" />,
      description: "80% share of total interest",
    },
    {
      title: "EDITH Allocation",
      value: formatCurrency(edithTotal),
      icon: <UserCheck className="h-4 w-4 text-gold" />,
      description: "20% share of total interest",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary font-mono">
              {card.value}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
