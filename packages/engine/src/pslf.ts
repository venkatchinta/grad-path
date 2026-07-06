import { CITATIONS, type Citation } from "./citations.js";

// Public Service Loan Forgiveness screening (34 CFR 685.219). This screens for
// the structural requirements; it is not a determination — only ED/the PSLF
// servicer can certify employment and count qualifying payments.

export type EmployerType =
  | "government"
  | "nonprofit-501c3"
  | "nonprofit-other"
  | "for-profit";

export type LoanProgram = "direct" | "ffel" | "perkins" | "private" | "unknown";

export interface PslfInput {
  employerType: EmployerType;
  /** Average hours per week; full-time for PSLF is 30+. */
  hoursPerWeek: number;
  loanPrograms: LoanProgram[];
  /** Qualifying payments already certified/estimated (0-120+). */
  qualifyingPayments?: number;
  /** Currently on an income-driven plan or RAP (qualifying repayment plans). */
  onQualifyingPlan?: boolean;
}

export interface PslfScreenResult {
  /** True when no structural blocker was found. */
  eligible: boolean;
  employerQualifies: boolean;
  fullTime: boolean;
  qualifyingPayments: number;
  paymentsRemaining: number;
  /** 0..1 progress toward 120 payments. */
  progress: number;
  /** Structural problems that must be fixed for payments to qualify. */
  blockers: string[];
  /** Cautions that don't block eligibility but the borrower should know. */
  warnings: string[];
  citations: Citation[];
}

export function screenPslf(input: PslfInput): PslfScreenResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const employerQualifies =
    input.employerType === "government" ||
    input.employerType === "nonprofit-501c3";
  if (!employerQualifies) {
    if (input.employerType === "nonprofit-other") {
      blockers.push(
        "Non-501(c)(3) nonprofits qualify only if they provide certain qualifying public services — this needs case-by-case review (use the PSLF Employer Search on StudentAid.gov).",
      );
    } else {
      blockers.push("For-profit employment does not qualify for PSLF.");
    }
  }

  const fullTime = input.hoursPerWeek >= 30;
  if (!fullTime) {
    blockers.push(
      "PSLF requires full-time employment (at least 30 hours/week, or the employer's full-time standard). Multiple qualifying part-time jobs can combine to 30+.",
    );
  }

  const programs = new Set(input.loanPrograms);
  if (programs.size === 0 || programs.has("unknown")) {
    warnings.push(
      "Loan program could not be determined for at least one loan; confirm on StudentAid.gov — only Direct Loans qualify.",
    );
  }
  if (programs.has("ffel") || programs.has("perkins")) {
    blockers.push(
      "FFEL and Perkins loans do not qualify until consolidated into a Direct Consolidation Loan. Consolidation timing affects your payment count — review before consolidating.",
    );
  }
  if (programs.has("private")) {
    warnings.push("Private loans are never eligible for PSLF.");
  }

  if (input.onQualifyingPlan === false) {
    blockers.push(
      "Payments must be made under a qualifying repayment plan (an income-driven plan or RAP) to count toward PSLF.",
    );
  }

  const qualifyingPayments = Math.max(0, input.qualifyingPayments ?? 0);
  const capped = Math.min(120, qualifyingPayments);

  return {
    eligible: blockers.length === 0,
    employerQualifies,
    fullTime,
    qualifyingPayments,
    paymentsRemaining: Math.max(0, 120 - qualifyingPayments),
    progress: capped / 120,
    blockers,
    warnings,
    citations: [CITATIONS.pslf],
  };
}
