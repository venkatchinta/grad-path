import { CITATIONS, type Citation } from "./citations.js";

// Afford stage: award letter comparison. Award letters are not standardized
// and often blend loans into a headline "total aid" figure; this module
// computes the numbers that actually matter for comparing offers — net price
// (COA minus gift aid) and what's left to cover after loans and work-study.

export interface AwardLetterInput {
  school: string;
  /** Full cost of attendance for one year, dollars. */
  costOfAttendance: {
    tuitionAndFees: number;
    housingAndFood: number;
    /** Books, transportation, personal expenses, etc. */
    otherCosts?: number;
  };
  /** Grants + scholarships for one year (money that is NOT repaid). */
  giftAid: number;
  /** Federal/institutional loans offered in the letter. */
  loansOffered: number;
  /** Work-study offered (earned, not guaranteed, not up-front). */
  workStudy?: number;
}

export interface AwardAnalysis {
  school: string;
  costOfAttendance: number;
  giftAid: number;
  /** The comparison number: COA minus gift aid. */
  netPrice: number;
  loansOffered: number;
  workStudy: number;
  /** Net price minus loans and work-study: cash the family must find. */
  outOfPocket: number;
  warnings: string[];
  citations: Citation[];
}

/** Dependent-undergraduate Direct Loan limits (34 CFR 685.203). */
export const DEPENDENT_UNDERGRAD_LOAN_LIMITS = {
  year1: 5_500,
  year2: 6_500,
  year3Plus: 7_500,
  aggregate: 31_000,
} as const;

export function analyzeAwardLetter(input: AwardLetterInput): AwardAnalysis {
  const coa =
    input.costOfAttendance.tuitionAndFees +
    input.costOfAttendance.housingAndFood +
    (input.costOfAttendance.otherCosts ?? 0);
  const workStudy = input.workStudy ?? 0;
  const netPrice = coa - input.giftAid;
  const outOfPocket = Math.max(0, netPrice - input.loansOffered - workStudy);

  const warnings: string[] = [];
  const totalAid = input.giftAid + input.loansOffered + workStudy;
  if (totalAid > 0 && input.loansOffered / totalAid > 0.5) {
    warnings.push(
      "More than half of this \"aid\" is loans — money that must be repaid with interest, not a discount.",
    );
  }
  if (input.loansOffered > DEPENDENT_UNDERGRAD_LOAN_LIMITS.year1) {
    warnings.push(
      `The loans offered ($${input.loansOffered.toLocaleString("en-US")}) exceed the first-year federal Direct Loan limit for dependent students ($${DEPENDENT_UNDERGRAD_LOAN_LIMITS.year1.toLocaleString("en-US")}) — the rest would be Parent PLUS or private loans, which carry more risk.`,
    );
  }
  if (netPrice < 0) {
    warnings.push(
      "Gift aid exceeds the cost of attendance — confirm the terms; refunds and renewal conditions vary.",
    );
  }
  if (input.giftAid > 0) {
    warnings.push(
      "Confirm which grants/scholarships are renewable all four years and what GPA or enrollment conditions apply — first-year-only awards make later years more expensive.",
    );
  }

  return {
    school: input.school,
    costOfAttendance: coa,
    giftAid: input.giftAid,
    netPrice,
    loansOffered: input.loansOffered,
    workStudy,
    outOfPocket,
    warnings,
    citations: [CITATIONS.netPrice, CITATIONS.awardLetterCompare, CITATIONS.loanLimits],
  };
}

export interface AwardComparison {
  /** Analyses ranked by net price, lowest (best) first. */
  analyses: AwardAnalysis[];
  lowestNetPriceSchool?: string;
  /** Four-year borrowing outlook at current offers, per school. */
  fourYearBorrowing: Array<{
    school: string;
    projected: number;
    exceedsAggregateLimit: boolean;
  }>;
  citations: Citation[];
}

export function compareAwardLetters(letters: AwardLetterInput[]): AwardComparison {
  const analyses = letters
    .map(analyzeAwardLetter)
    .sort((a, b) => a.netPrice - b.netPrice);

  const fourYearBorrowing = analyses.map((a) => {
    const projected = a.loansOffered * 4;
    return {
      school: a.school,
      projected,
      exceedsAggregateLimit: projected > DEPENDENT_UNDERGRAD_LOAN_LIMITS.aggregate,
    };
  });

  return {
    analyses,
    lowestNetPriceSchool: analyses[0]?.school,
    fourYearBorrowing,
    citations: [CITATIONS.netPrice, CITATIONS.awardLetterCompare, CITATIONS.loanLimits],
  };
}
