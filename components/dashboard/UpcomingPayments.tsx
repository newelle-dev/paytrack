import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Clock } from "lucide-react";

interface ScheduleItem {
  id: string;
  expected_date: string;
  expected_amount: number;
  borrower_name: string;
  loan_category: string;
}

interface UpcomingPaymentsProps {
  dueToday: ScheduleItem[];
  dueThisWeek: ScheduleItem[];
}

export function UpcomingPayments({
  dueToday,
  dueThisWeek,
}: UpcomingPaymentsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-ivory-cream">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-gold" />
              Due Today
            </CardTitle>
            <CardDescription>
              Payments expected for {format(new Date(), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Badge variant={dueToday.length > 0 ? "error" : "success"}>
            {dueToday.length} Pending
          </Badge>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-ivory-light">
                <TableHead className="pl-6">Borrower</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dueToday.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-text-secondary"
                  >
                    No payments due today.
                  </TableCell>
                </TableRow>
              ) : (
                dueToday.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 font-medium text-text-primary">
                      {item.borrower_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.loan_category}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-bold">
                      {formatCurrency(item.expected_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-ivory-cream">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              Next 7 Days
            </CardTitle>
            <CardDescription>Upcoming collections for the week</CardDescription>
          </div>
          <Badge variant="default">{dueThisWeek.length} Upcoming</Badge>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-ivory-light">
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead className="text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dueThisWeek.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-text-secondary"
                  >
                    No upcoming payments this week.
                  </TableCell>
                </TableRow>
              ) : (
                dueThisWeek.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 text-text-secondary text-sm">
                      {format(parseISO(item.expected_date), "MMM d")}
                    </TableCell>
                    <TableCell className="font-medium text-text-primary">
                      {item.borrower_name}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-medium">
                      {formatCurrency(item.expected_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
