import { CITATIONS, type Citation } from "./citations.js";
import type { LoanProgram } from "./pslf.js";

// Tolerant parser for StudentAid.gov "My Aid Data" exports. The export format
// varies over time and by tool version, so this parser: accepts JSON with the
// loan list under several known key names, matches field names loosely, never
// throws on a malformed row (it records a warning instead), and reports what
// it could not understand. Parsing happens on the user's device only.

export interface ParsedLoan {
  program: LoanProgram;
  typeDescription: string;
  /** Outstanding balance in dollars (principal + interest when available). */
  balance: number;
  /** Annual interest rate as a fraction (0.065 = 6.5%). */
  interestRate: number;
  status?: string;
}

export interface ParseResult {
  loans: ParsedLoan[];
  warnings: string[];
  citations: Citation[];
}

const LOAN_LIST_KEYS = ["loans", "loanRecords", "LoanRecords", "aidData", "records"];

function findLoanArray(root: unknown): unknown[] | undefined {
  if (Array.isArray(root)) return root;
  if (typeof root !== "object" || root === null) return undefined;
  const obj = root as Record<string, unknown>;
  for (const key of LOAN_LIST_KEYS) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  // One level of nesting (e.g. { studentLoans: { loans: [...] } })
  for (const value of Object.values(obj)) {
    const found = findLoanArray(value);
    if (found) return found;
  }
  return undefined;
}

/** Case/format-insensitive field lookup: matches balance, OutstandingBalance, outstanding_balance… */
function pickField(row: Record<string, unknown>, candidates: string[]): unknown {
  const normalized = new Map(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().replace(/[_\s-]/g, ""), v]),
  );
  for (const candidate of candidates) {
    const value = normalized.get(candidate.toLowerCase());
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = Number(value.replace(/[$,%\s,]/g, ""));
    if (Number.isFinite(cleaned)) return cleaned;
  }
  return undefined;
}

export function classifyLoanProgram(typeDescription: string): LoanProgram {
  const t = typeDescription.toLowerCase();
  if (t.includes("direct")) return "direct";
  if (t.includes("ffel") || t.includes("stafford") || t.includes("family education"))
    return "ffel";
  if (t.includes("perkins")) return "perkins";
  if (t.includes("private") || t.includes("alternative")) return "private";
  return "unknown";
}

export function parseMyAidData(text: string): ParseResult {
  const warnings: string[] = [];
  const loans: ParsedLoan[] = [];

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return {
      loans,
      warnings: [
        "Could not read this file as a My Aid Data JSON export. Download the JSON version of 'My Aid Data' from StudentAid.gov, or enter loans manually.",
      ],
      citations: [CITATIONS.myAidData],
    };
  }

  const rows = findLoanArray(root);
  if (!rows) {
    return {
      loans,
      warnings: ["No loan list found in this file; enter loans manually."],
      citations: [CITATIONS.myAidData],
    };
  }

  rows.forEach((rawRow, i) => {
    if (typeof rawRow !== "object" || rawRow === null) {
      warnings.push(`Skipped loan entry ${i + 1}: not a record.`);
      return;
    }
    const row = rawRow as Record<string, unknown>;

    const typeDescription = String(
      pickField(row, ["loanTypeDescription", "loanType", "type", "program", "loanProgram"]) ??
        "unknown",
    );

    const principal = toNumber(
      pickField(row, ["outstandingPrincipal", "outstandingPrincipalBalance", "principalBalance"]),
    );
    const interest = toNumber(
      pickField(row, ["outstandingInterest", "outstandingInterestBalance", "interestBalance"]),
    );
    const total = toNumber(
      pickField(row, ["outstandingBalance", "currentBalance", "balance", "totalBalance"]),
    );
    const balance = total ?? (principal !== undefined ? principal + (interest ?? 0) : undefined);
    if (balance === undefined) {
      warnings.push(`Skipped loan entry ${i + 1} (${typeDescription}): no balance found.`);
      return;
    }

    let rate = toNumber(pickField(row, ["interestRate", "rate", "interestRatePercent"])) ?? 0;
    if (rate > 1) rate = rate / 100; // "6.5" means 6.5%
    if (rate === 0) {
      warnings.push(
        `Loan entry ${i + 1} (${typeDescription}): no interest rate found; using 0% — correct this before comparing plans.`,
      );
    }

    const status = pickField(row, ["loanStatusDescription", "loanStatus", "status"]);

    loans.push({
      program: classifyLoanProgram(typeDescription),
      typeDescription,
      balance,
      interestRate: rate,
      status: status === undefined ? undefined : String(status),
    });
  });

  if (loans.length === 0 && warnings.length === 0) {
    warnings.push("The file's loan list was empty.");
  }

  return { loans, warnings, citations: [CITATIONS.myAidData] };
}

/** Aggregate parsed loans into the balance + weighted-average rate the calculators use. */
export function summarizeLoans(loans: ParsedLoan[]): {
  balance: number;
  interestRate: number;
} {
  const balance = loans.reduce((sum, l) => sum + l.balance, 0);
  if (balance === 0) return { balance: 0, interestRate: 0 };
  const weighted = loans.reduce((sum, l) => sum + l.balance * l.interestRate, 0);
  return { balance, interestRate: weighted / balance };
}
