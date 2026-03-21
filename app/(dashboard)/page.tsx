import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { startOfDay, endOfDay, addDays } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Active Loans for Stats
  const { data: activeLoans, error: loansError } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "Active");

  if (loansError) console.error("Error fetching active loans:", loansError);

  // 2. Calculate Stats
  const stats = (activeLoans || []).reduce(
    (acc, loan) => {
      const principal = Number(loan.principal_amount);
      const interest = Number(loan.total_interest_expected);
      const rcAlloc = Number(loan.rc_allocation) / 100;
      const edithAlloc = Number(loan.edith_allocation) / 100;

      acc.totalActiveCapital += principal;
      acc.totalInterestExpected += interest;
      acc.rcTotal += interest * rcAlloc;
      acc.edithTotal += interest * edithAlloc;
      return acc;
    },
    {
      totalActiveCapital: 0,
      totalInterestExpected: 0,
      rcTotal: 0,
      edithTotal: 0,
    },
  );

  // 3. Fetch Upcoming Schedules (Today & Next 7 Days)
  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const weekEnd = endOfDay(addDays(today, 7)).toISOString();

  // Fetch all schedules for the next 7 days for the user's active loans
  const { data: upcomingSchedules, error: schedulesError } = await supabase
    .from("schedules")
    .select(
      `
      id,
      expected_date,
      expected_amount,
      loans!inner (
        loan_category,
        status,
        user_id,
        borrowers (
          first_name,
          last_name
        )
      )
    `,
    )
    .eq("loans.user_id", user.id)
    .eq("loans.status", "Active")
    .gte("expected_date", todayStart)
    .lte("expected_date", weekEnd)
    .order("expected_date", { ascending: true });

  if (schedulesError)
    console.error("Error fetching schedules:", schedulesError);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedSchedules = (upcomingSchedules || []).map((sch: any) => ({
    id: sch.id,
    expected_date: sch.expected_date,
    expected_amount: Number(sch.expected_amount),
    borrower_name: `${sch.loans.borrowers.first_name} ${sch.loans.borrowers.last_name}`,
    loan_category: sch.loans.loan_category,
  }));

  const dueToday = formattedSchedules.filter(
    (s) => s.expected_date >= todayStart && s.expected_date <= todayEnd,
  );
  const dueThisWeek = formattedSchedules.filter(
    (s) => s.expected_date > todayEnd,
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-text-secondary">
          Welcome back! Here&apos;s what&apos;s happening with your portfolio today.
        </p>
      </header>

      <section>
        <SummaryCards {...stats} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-primary">
          Quick Actions
        </h2>
        <QuickActions />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-primary">
          Upcoming Payments
        </h2>
        <UpcomingPayments dueToday={dueToday} dueThisWeek={dueThisWeek} />
      </section>
    </div>
  );
}
