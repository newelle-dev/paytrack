export interface Borrower {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  active_loans_count?: number;
}

export interface Schedule {
  id: string;
  expected_date: string;
  expected_amount: number;
  created_at?: string;
}

export interface Payment {
  id: string;
  id_prefix?: string;
  amount_paid: number;
  date_paid: string;
  payment_method: string | null;
  notes: string | null;
  created_at?: string;
  loan_id?: string;
  loan_category?: string;
}

export interface Loan {
  id: string;
  principal_amount: number;
  loan_category: string;
  status: string;
  term_type: string;
  release_date: string;
  created_at: string;
  total_interest_expected: number;
  rc_allocation: number;
  edith_allocation: number;
  borrower?: Borrower;
  schedules?: Schedule[];
  payments?: Payment[];
  remaining_balance?: number;
}
