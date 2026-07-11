import { CITATIONS, type Citation } from "./citations.js";
import { DEPENDENT_UNDERGRAD_LOAN_LIMITS } from "./afford.js";

// Family funding plan: attach funding sources (529 plans, savings, monthly
// cash-flow contributions, personal borrowing) and measure them against the
// multi-year cost of a chosen school. Ordering rule encoded here: free money
// and savings first, then federal student loans within their limits, and only
// then PLUS/private/personal borrowing — which this module warns about rather
// than recommends. All amounts stay on the user's device.

export type FundingKind =
  | "529"
  | "savings"
  | "monthly-contribution"
  | "personal-loan"
  | "other";

export interface FundingSource {
  kind: FundingKind;
  /** e.g. "NY 529 (parent)", "Grandma's 529", "HELOC" */
  label: string;
  /** One-time total for balances; per-month for monthly-contribution. */
  amount: number;
  owner?: "parent" | "student" | "grandparent" | "other";
}

export interface FundingPlanInput {
  /** Net price per year for the chosen school (from the award comparison). */
  annualNetPrice: number;
  /** Years to graduation (default 4). */
  years?: number;
  sources: FundingSource[];
}

export interface FundingPlanResult {
  years: number;
  totalCost: number;
  /** Sum of non-borrowed funding over the horizon (529 + savings + monthly). */
  fundsAvailable: number;
  fundsByKind: Partial<Record<FundingKind, number>>;
  /** 0..1 share of total cost covered without any borrowing. */
  coverageRatio: number;
  gapBeforeBorrowing: number;
  /** Federal Direct Loan capacity for a dependent undergrad over the horizon. */
  federalLoanCapacity: number;
  federalLoansNeeded: number;
  /** Remaining gap after non-borrowed funds and federal student loans. */
  gapAfterFederalLoans: number;
  warnings: string[];
  citations: Citation[];
}

const round0 = (n: number) => Math.round(n);

/** Federal Direct Loan capacity for a dependent undergrad across `years`. */
export function dependentFederalLoanCapacity(years: number): number {
  const { year1, year2, year3Plus, aggregate } = DEPENDENT_UNDERGRAD_LOAN_LIMITS;
  const schedule = [year1, year2, year3Plus, year3Plus];
  let total = 0;
  for (let y = 0; y < years; y++) total += schedule[Math.min(y, 3)];
  return Math.min(total, aggregate);
}

export function planFunding(input: FundingPlanInput): FundingPlanResult {
  const years = input.years ?? 4;
  if (years < 1 || years > 8) throw new RangeError("years must be 1-8");
  const totalCost = round0(input.annualNetPrice * years);

  const fundsByKind: Partial<Record<FundingKind, number>> = {};
  let fundsAvailable = 0;
  let personalBorrowing = 0;
  for (const source of input.sources) {
    const value =
      source.kind === "monthly-contribution"
        ? source.amount * 12 * years
        : source.amount;
    fundsByKind[source.kind] = (fundsByKind[source.kind] ?? 0) + round0(value);
    if (source.kind === "personal-loan") personalBorrowing += round0(value);
    else fundsAvailable += round0(value);
  }

  const gapBeforeBorrowing = Math.max(0, totalCost - fundsAvailable);
  const federalLoanCapacity = dependentFederalLoanCapacity(years);
  const federalLoansNeeded = Math.min(gapBeforeBorrowing, federalLoanCapacity);
  const gapAfterFederalLoans = gapBeforeBorrowing - federalLoansNeeded;
  const coverageRatio = totalCost === 0 ? 1 : Math.min(1, fundsAvailable / totalCost);

  const warnings: string[] = [];
  if (personalBorrowing > 0) {
    warnings.push(
      "This plan includes personal/private borrowing. Those loans have no income-driven plans, forgiveness, or federal protections — exhaust federal student loans first, and treat this as a last resort.",
    );
  }
  if ((fundsByKind["529"] ?? 0) > 0) {
    warnings.push(
      "529 withdrawals are tax-free only for qualified expenses (tuition, fees, books, and housing up to the school's allowance) — keep receipts and match withdrawals to expenses in the same tax year.",
    );
  }
  if (input.sources.some((s) => s.kind === "529" && s.owner === "grandparent")) {
    warnings.push(
      "Good news on grandparent 529s: since the 2024-25 FAFSA they no longer count against the student's aid eligibility.",
    );
  }
  if (gapAfterFederalLoans > 0) {
    warnings.push(
      `After savings and federal student loans there is still a $${gapAfterFederalLoans.toLocaleString("en-US")} gap over ${years} years. Options in rough order: cheaper school, aid appeal, outside scholarships, more monthly contribution, then Parent PLUS or private loans (with real risk to the parent's finances).`,
    );
  }

  return {
    years,
    totalCost,
    fundsAvailable,
    fundsByKind,
    coverageRatio,
    gapBeforeBorrowing,
    federalLoanCapacity,
    federalLoansNeeded,
    gapAfterFederalLoans,
    warnings,
    citations: [
      CITATIONS.plan529,
      CITATIONS.grandparent529,
      CITATIONS.privateVsFederal,
      CITATIONS.loanLimits,
    ],
  };
}
