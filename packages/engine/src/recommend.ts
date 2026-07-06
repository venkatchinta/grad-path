import type { Citation } from "./citations.js";
import {
  comparePlans,
  type BorrowerFinances,
  type LoanSummary,
  type PlanResult,
} from "./payment-plans.js";
import { screenPslf, type PslfInput, type PslfScreenResult } from "./pslf.js";
import type { ParsedLoan } from "./parsers.js";

// Recommendation with expert-escalation logic. The engine ranks plans by
// simple, explainable rules and — critically — refuses to be confident where
// it shouldn't be: known edge cases route to a human expert instead of a
// best-effort answer.

export interface RecommendationInput {
  borrower: BorrowerFinances;
  loans: LoanSummary;
  parsedLoans?: ParsedLoan[];
  pslf?: PslfInput;
}

export interface Recommendation {
  plans: PlanResult[];
  /** Plan id with the lowest monthly payment. */
  lowestPaymentPlan: PlanResult["plan"];
  pslf?: PslfScreenResult;
  /** Situations that need a human expert / official servicer, not this tool. */
  escalations: string[];
  nextSteps: string[];
  citations: Citation[];
}

const ESCALATION_STATUS_PATTERNS: Array<[RegExp, string]> = [
  [/default/i, "A loan appears to be in default. Default has its own resolution paths (rehabilitation, consolidation) — talk to the Default Resolution Group before choosing a plan."],
  [/joint|spousal/i, "A joint/spousal consolidation loan was detected. These have unique separation rules — consult an expert before acting."],
  [/bankrupt/i, "A bankruptcy-related status was detected — consult a student loan attorney."],
  [/forbearance|deferment/i, "A loan is in forbearance/deferment; months in most forbearances do not count toward forgiveness. Confirm status before relying on payment counts."],
];

export function recommend(input: RecommendationInput): Recommendation {
  const plans = comparePlans(input.borrower, input.loans);
  const lowest = plans.reduce((a, b) => (b.monthlyPayment < a.monthlyPayment ? b : a));

  const escalations: string[] = [];
  for (const loan of input.parsedLoans ?? []) {
    const haystack = `${loan.status ?? ""} ${loan.typeDescription}`;
    for (const [pattern, message] of ESCALATION_STATUS_PATTERNS) {
      if (pattern.test(haystack) && !escalations.includes(message)) {
        escalations.push(message);
      }
    }
    if (/parent plus|plus loan.*parent/i.test(loan.typeDescription)) {
      const msg =
        "Parent PLUS loans have restricted repayment-plan access; the options shown may not apply. Confirm with your servicer.";
      if (!escalations.includes(msg)) escalations.push(msg);
    }
  }

  const pslf = input.pslf ? screenPslf(input.pslf) : undefined;

  const nextSteps: string[] = [
    "Verify these numbers against your servicer's statement before acting — this tool screens, it does not certify.",
  ];
  if (pslf?.eligible) {
    nextSteps.push(
      `You screen as PSLF-eligible with ~${pslf.paymentsRemaining} qualifying payments remaining. Certify your employment via the PSLF Help Tool on StudentAid.gov.`,
    );
  } else if (pslf) {
    nextSteps.push(
      "Resolve the PSLF blockers listed before counting on forgiveness.",
    );
  }
  if (lowest.plan !== "standard") {
    nextSteps.push(
      `Apply for ${lowest.label} on StudentAid.gov if the lower payment fits your situation (note total interest paid over a longer term can be higher).`,
    );
  }
  if (escalations.length > 0) {
    nextSteps.unshift(
      "Your situation has flags that need a human expert — see the escalations before choosing a plan.",
    );
  }

  const citations = plans.flatMap((p) => p.citations);
  if (pslf) citations.push(...pslf.citations);
  const deduped = [...new Map(citations.map((c) => [c.id, c])).values()];

  return {
    plans,
    lowestPaymentPlan: lowest.plan,
    pslf,
    escalations,
    nextSteps,
    citations: deduped,
  };
}
