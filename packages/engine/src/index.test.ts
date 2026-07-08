import { describe, expect, it } from "vitest";
import {
  GRADPATH_ENGINE_VERSION,
  povertyGuideline,
  regionForState,
  standardPayment,
  ibrPayment,
  rapPayment,
  rapBaseAnnualAmount,
  comparePlans,
  screenPslf,
  parseMyAidData,
  summarizeLoans,
  recommend,
  analyzeAwardLetter,
  compareAwardLetters,
} from "./index.js";

describe("@gradpath/engine", () => {
  it("exposes a version", () => {
    expect(GRADPATH_ENGINE_VERSION).toBe("0.1.0");
  });
});

describe("poverty guidelines (2025)", () => {
  it("matches the published 2025 figures for the contiguous states", () => {
    expect(povertyGuideline({ householdSize: 1 }).amount).toBe(15_650);
    expect(povertyGuideline({ householdSize: 4 }).amount).toBe(15_650 + 3 * 5_500);
  });

  it("uses Alaska and Hawaii tables by state code", () => {
    expect(povertyGuideline({ householdSize: 1, state: "AK" }).amount).toBe(19_550);
    expect(povertyGuideline({ householdSize: 2, state: "hi" }).amount).toBe(17_990 + 6_320);
    expect(regionForState("CA")).toBe("contiguous");
  });

  it("attaches a citation and rejects invalid input", () => {
    const result = povertyGuideline({ householdSize: 3 });
    expect(result.citations[0].id).toBe("hhs-poverty-2025");
    expect(() => povertyGuideline({ householdSize: 0 })).toThrow(RangeError);
    expect(() => povertyGuideline({ householdSize: 2, year: 1999 })).toThrow(RangeError);
  });
});

describe("standard 10-year plan", () => {
  it("amortizes correctly ($10,000 at 5% ≈ $106.07/mo)", () => {
    expect(standardPayment({ balance: 10_000, interestRate: 0.05 }).monthlyPayment).toBeCloseTo(
      106.07,
      2,
    );
  });

  it("handles 0% interest and enforces the $50 minimum", () => {
    expect(standardPayment({ balance: 12_000, interestRate: 0 }).monthlyPayment).toBe(100);
    const small = standardPayment({ balance: 1_000, interestRate: 0.05 });
    expect(small.monthlyPayment).toBe(50);
    expect(small.notes.join(" ")).toMatch(/minimum/);
  });
});

describe("IBR", () => {
  const loans = { balance: 60_000, interestRate: 0.065 };

  it("computes 15% of discretionary income for classic borrowers", () => {
    // AGI 50,000, household 1: discretionary = 50,000 − 1.5 × 15,650 = 26,525
    const result = ibrPayment({ agi: 50_000, familySize: 1 }, loans);
    expect(result.monthlyPayment).toBeCloseTo((26_525 * 0.15) / 12, 2); // 331.56
    expect(result.forgivenessAfterMonths).toBe(300);
  });

  it("uses 10% and 20-year forgiveness for new borrowers", () => {
    const result = ibrPayment(
      { agi: 50_000, familySize: 1, newBorrowerOnOrAfterJuly2014: true },
      loans,
    );
    expect(result.monthlyPayment).toBeCloseTo((26_525 * 0.1) / 12, 2); // 221.04
    expect(result.forgivenessAfterMonths).toBe(240);
  });

  it("floors at $0 for low income and caps at the standard payment", () => {
    expect(ibrPayment({ agi: 20_000, familySize: 3 }, loans).monthlyPayment).toBe(0);
    const capped = ibrPayment({ agi: 500_000, familySize: 1 }, { balance: 10_000, interestRate: 0.05 });
    expect(capped.monthlyPayment).toBeCloseTo(106.07, 2);
    expect(capped.notes.join(" ")).toMatch(/caps/);
  });
});

describe("RAP", () => {
  it("applies the AGI tier table", () => {
    expect(rapBaseAnnualAmount(9_000)).toBe(120); // ≤ $10k: $120/yr
    expect(rapBaseAnnualAmount(15_000)).toBe(150); // 1%
    expect(rapBaseAnnualAmount(20_000)).toBe(200); // boundary stays in 1% tier
    expect(rapBaseAnnualAmount(20_001)).toBeCloseTo(400.02, 2); // 2%
    expect(rapBaseAnnualAmount(52_000)).toBe(2_600); // 5%
    expect(rapBaseAnnualAmount(150_000)).toBe(15_000); // 10%
  });

  it("deducts $50/month per dependent with a $10 floor", () => {
    // 52,000 AGI → 2,600/yr → 216.67/mo; two dependents → 116.67
    expect(rapPayment({ agi: 52_000, familySize: 4, dependents: 2 }).monthlyPayment).toBeCloseTo(
      116.67,
      2,
    );
    const floored = rapPayment({ agi: 15_000, familySize: 2, dependents: 1 });
    expect(floored.monthlyPayment).toBe(10);
    expect(floored.forgivenessAfterMonths).toBe(360);
  });

  it("compares all three plans", () => {
    const plans = comparePlans({ agi: 52_000, familySize: 1 }, { balance: 60_000, interestRate: 0.065 });
    expect(plans.map((p) => p.plan)).toEqual(["standard", "ibr", "rap"]);
    for (const plan of plans) expect(plan.citations.length).toBeGreaterThan(0);
  });
});

describe("PSLF screening", () => {
  it("passes a full-time 501(c)(3) worker with Direct loans", () => {
    const result = screenPslf({
      employerType: "nonprofit-501c3",
      hoursPerWeek: 40,
      loanPrograms: ["direct"],
      qualifyingPayments: 34,
      onQualifyingPlan: true,
    });
    expect(result.eligible).toBe(true);
    expect(result.paymentsRemaining).toBe(86);
    expect(result.progress).toBeCloseTo(34 / 120, 5);
  });

  it("blocks for-profit employment, part-time hours, and FFEL loans", () => {
    const result = screenPslf({
      employerType: "for-profit",
      hoursPerWeek: 20,
      loanPrograms: ["ffel"],
    });
    expect(result.eligible).toBe(false);
    expect(result.blockers).toHaveLength(3);
  });

  it("warns on unknown programs instead of blocking", () => {
    const result = screenPslf({
      employerType: "government",
      hoursPerWeek: 40,
      loanPrograms: ["unknown"],
    });
    expect(result.eligible).toBe(true);
    expect(result.warnings.join(" ")).toMatch(/confirm/i);
  });
});

describe("My Aid Data parser", () => {
  it("parses a typical export shape", () => {
    const file = JSON.stringify({
      loans: [
        {
          loanTypeDescription: "Direct Unsubsidized Loan",
          outstandingPrincipal: 20000,
          outstandingInterest: 500,
          interestRate: 6.5,
          loanStatusDescription: "In Repayment",
        },
        {
          loanTypeDescription: "FFEL Stafford",
          outstandingBalance: "$4,000.00",
          interestRate: "5.0%",
        },
      ],
    });
    const result = parseMyAidData(file);
    expect(result.loans).toHaveLength(2);
    expect(result.loans[0]).toMatchObject({ program: "direct", balance: 20_500, interestRate: 0.065 });
    expect(result.loans[1]).toMatchObject({ program: "ffel", balance: 4_000, interestRate: 0.05 });
    expect(result.warnings).toHaveLength(0);
  });

  it("tolerates nesting, odd casing, and bad rows without throwing", () => {
    const file = JSON.stringify({
      studentAid: {
        LoanRecords: [
          { loan_type: "Direct Subsidized", current_balance: 9000, rate: 0.045 },
          "garbage",
          { loan_type: "Mystery Loan" },
        ],
      },
    });
    const result = parseMyAidData(file);
    expect(result.loans).toHaveLength(1);
    expect(result.loans[0].program).toBe("direct");
    expect(result.warnings).toHaveLength(2);
  });

  it("fails soft on non-JSON input", () => {
    const result = parseMyAidData("PDF-1.4 not json");
    expect(result.loans).toHaveLength(0);
    expect(result.warnings[0]).toMatch(/manually/);
  });

  it("summarizes into balance and weighted rate", () => {
    const summary = summarizeLoans([
      { program: "direct", typeDescription: "", balance: 10_000, interestRate: 0.05 },
      { program: "direct", typeDescription: "", balance: 30_000, interestRate: 0.07 },
    ]);
    expect(summary.balance).toBe(40_000);
    expect(summary.interestRate).toBeCloseTo(0.065, 5);
    expect(summarizeLoans([])).toEqual({ balance: 0, interestRate: 0 });
  });
});

describe("award letter comparison (Afford)", () => {
  const stateSchool = {
    school: "State U",
    costOfAttendance: { tuitionAndFees: 12_000, housingAndFood: 13_000, otherCosts: 3_000 },
    giftAid: 10_000,
    loansOffered: 5_500,
    workStudy: 2_000,
  };
  const privateSchool = {
    school: "Private College",
    costOfAttendance: { tuitionAndFees: 58_000, housingAndFood: 16_000 },
    giftAid: 30_000,
    loansOffered: 32_000,
  };

  it("computes net price and out-of-pocket correctly", () => {
    const a = analyzeAwardLetter(stateSchool);
    expect(a.costOfAttendance).toBe(28_000);
    expect(a.netPrice).toBe(18_000); // COA − gift aid
    expect(a.outOfPocket).toBe(10_500); // net − loans − work-study
  });

  it("warns when loans dominate the package or exceed federal limits", () => {
    const a = analyzeAwardLetter(privateSchool);
    expect(a.warnings.join(" ")).toMatch(/half of this "aid" is loans/);
    expect(a.warnings.join(" ")).toMatch(/exceed the first-year federal Direct Loan limit/);
  });

  it("ranks schools by net price and projects four-year borrowing", () => {
    const cmp = compareAwardLetters([privateSchool, stateSchool]);
    expect(cmp.lowestNetPriceSchool).toBe("State U");
    expect(cmp.analyses.map((a) => a.school)).toEqual(["State U", "Private College"]);
    const privateProjection = cmp.fourYearBorrowing.find((f) => f.school === "Private College");
    expect(privateProjection).toMatchObject({ projected: 128_000, exceedsAggregateLimit: true });
    expect(cmp.citations.length).toBeGreaterThan(0);
  });
});

describe("recommendation + escalation", () => {
  const base = {
    borrower: { agi: 52_000, familySize: 1 },
    loans: { balance: 60_000, interestRate: 0.065 },
  };

  it("identifies the lowest-payment plan and dedupes citations", () => {
    const result = recommend(base);
    const payments = Object.fromEntries(result.plans.map((p) => [p.plan, p.monthlyPayment]));
    expect(payments[result.lowestPaymentPlan]).toBe(
      Math.min(...result.plans.map((p) => p.monthlyPayment)),
    );
    const ids = result.citations.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("escalates on default status and Parent PLUS loans", () => {
    const result = recommend({
      ...base,
      parsedLoans: [
        { program: "direct", typeDescription: "Direct Loan", balance: 10_000, interestRate: 0.05, status: "Defaulted" },
        { program: "direct", typeDescription: "Parent PLUS Loan", balance: 5_000, interestRate: 0.07 },
      ],
    });
    expect(result.escalations.length).toBe(2);
    expect(result.nextSteps[0]).toMatch(/human expert/);
  });

  it("includes PSLF next steps when screening passes", () => {
    const result = recommend({
      ...base,
      pslf: {
        employerType: "government",
        hoursPerWeek: 40,
        loanPrograms: ["direct"],
        qualifyingPayments: 100,
        onQualifyingPlan: true,
      },
    });
    expect(result.pslf?.eligible).toBe(true);
    expect(result.nextSteps.join(" ")).toMatch(/20 qualifying payments remaining/);
  });
});
