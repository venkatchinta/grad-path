import { CITATIONS, type Citation } from "./citations.js";
import { povertyGuideline, type PovertyRegion } from "./poverty-guidelines.js";

// Deterministic payment calculators: Standard 10-year, IBR, and RAP.
// All amounts are dollars; monthly payments are rounded to the cent.

export interface BorrowerFinances {
  /** Adjusted gross income, annual dollars. */
  agi: number;
  /** Tax family size (borrower + spouse + dependents as applicable). */
  familySize: number;
  /** Two-letter state code, used for the poverty-guideline region. */
  state?: string;
  region?: PovertyRegion;
  /** Number of dependents (RAP deducts $50/month per dependent). */
  dependents?: number;
  /**
   * IBR distinguishes "new borrowers" — no outstanding federal loan balance
   * when receiving a new loan on/after July 1, 2014 (10% / 20-yr terms).
   */
  newBorrowerOnOrAfterJuly2014?: boolean;
}

export interface LoanSummary {
  /** Total outstanding balance (principal + accrued interest), dollars. */
  balance: number;
  /** Weighted-average annual interest rate as a fraction, e.g. 0.065. */
  interestRate: number;
}

export interface PlanResult {
  plan: "standard" | "ibr" | "rap";
  label: string;
  monthlyPayment: number;
  /** Number of monthly payments to loan payoff or forgiveness. */
  termMonths: number;
  forgivenessAfterMonths?: number;
  notes: string[];
  citations: Citation[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Standard 10-year plan: fixed amortized payment, $50/month minimum. */
export function standardPayment(loans: LoanSummary): PlanResult {
  if (loans.balance < 0) throw new RangeError("balance must be >= 0");
  const n = 120;
  const r = loans.interestRate / 12;
  const raw =
    r === 0 ? loans.balance / n : (loans.balance * r) / (1 - (1 + r) ** -n);
  const monthlyPayment = round2(Math.max(50, raw));
  const notes: string[] = [];
  if (raw < 50 && loans.balance > 0) {
    notes.push(
      "Calculated payment is below the $50 minimum; the minimum applies and the loan pays off in fewer than 120 months.",
    );
  }
  return {
    plan: "standard",
    label: "Standard (10-year)",
    monthlyPayment,
    termMonths: n,
    notes,
    citations: [CITATIONS.standardPlan],
  };
}

/**
 * Income-Based Repayment. Discretionary income = AGI − 150% of the poverty
 * guideline for the borrower's family size. Payment is 15% of discretionary
 * income (25-yr forgiveness), or 10% and 20-yr forgiveness for new borrowers
 * on/after July 1, 2014. Payment is capped at the Standard 10-year amount
 * computed at plan entry.
 */
export function ibrPayment(
  borrower: BorrowerFinances,
  loans: LoanSummary,
): PlanResult {
  const guideline = povertyGuideline({
    householdSize: borrower.familySize,
    state: borrower.state,
    region: borrower.region,
  });
  const discretionary = Math.max(0, borrower.agi - 1.5 * guideline.amount);
  const isNew = borrower.newBorrowerOnOrAfterJuly2014 === true;
  const share = isNew ? 0.1 : 0.15;
  const forgivenessAfterMonths = isNew ? 240 : 300;

  const uncapped = round2((discretionary * share) / 12);
  const cap = standardPayment(loans).monthlyPayment;
  const monthlyPayment = Math.min(uncapped, cap);

  const notes = [
    isNew
      ? "New-borrower IBR terms applied: 10% of discretionary income, forgiveness after 20 years."
      : "Classic IBR terms applied: 15% of discretionary income, forgiveness after 25 years.",
    `Discretionary income basis: AGI minus 150% of the ${guideline.year} poverty guideline ($${guideline.amount.toLocaleString("en-US")} for a household of ${guideline.householdSize}).`,
  ];
  if (uncapped > cap) {
    notes.push(
      "Income-based amount exceeds the Standard 10-year payment; IBR caps the payment at the Standard amount.",
    );
  }
  if (monthlyPayment === 0) {
    notes.push("$0/month payments still count toward IBR forgiveness.");
  }

  return {
    plan: "ibr",
    label: isNew ? "IBR (new borrower)" : "IBR",
    monthlyPayment,
    termMonths: forgivenessAfterMonths,
    forgivenessAfterMonths,
    notes,
    citations: [...guideline.citations, CITATIONS.ibr],
  };
}

/**
 * Repayment Assistance Plan (RAP) AGI tiers: $10,000 or less pays $120/year;
 * then 1% of AGI per $10,000 bracket up to 10% above $100,000. The monthly
 * amount is reduced by $50 per dependent, with a $10/month floor. Forgiveness
 * after 360 qualifying payments. Unpaid accrued interest is not charged.
 */
export function rapBaseAnnualAmount(agi: number): number {
  if (agi < 0) throw new RangeError("agi must be >= 0");
  if (agi <= 10_000) return 120;
  const bracket = Math.min(10, Math.ceil((agi - 10_000) / 10_000));
  return agi * (bracket / 100);
}

export function rapPayment(borrower: BorrowerFinances): PlanResult {
  const base = rapBaseAnnualAmount(borrower.agi) / 12;
  const dependents = borrower.dependents ?? 0;
  const monthlyPayment = round2(Math.max(10, base - 50 * dependents));
  const notes = [
    "RAP payments do not charge unpaid accrued interest, so the balance does not grow while paying as agreed.",
  ];
  if (dependents > 0) {
    notes.push(`Payment reduced by $50/month for each of ${dependents} dependent(s).`);
  }
  if (base - 50 * dependents < 10) {
    notes.push("The $10/month RAP minimum payment applies.");
  }
  return {
    plan: "rap",
    label: "Repayment Assistance Plan (RAP)",
    monthlyPayment,
    termMonths: 360,
    forgivenessAfterMonths: 360,
    notes,
    citations: [CITATIONS.rap],
  };
}

/** Convenience: compute all supported plans for side-by-side comparison. */
export function comparePlans(
  borrower: BorrowerFinances,
  loans: LoanSummary,
): PlanResult[] {
  return [
    standardPayment(loans),
    ibrPayment(borrower, loans),
    rapPayment(borrower),
  ];
}
