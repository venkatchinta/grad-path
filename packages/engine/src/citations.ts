// Citation infrastructure. Every rule in this engine must trace back to an
// official source (design principle: citation-backed, auditable, no AI).

export interface Citation {
  /** Stable identifier, e.g. "hhs-poverty-2025" */
  id: string;
  title: string;
  url: string;
  /** Optional note, e.g. effective date or the specific rule relied upon */
  note?: string;
}

export const CITATIONS = {
  hhsPoverty2025: {
    id: "hhs-poverty-2025",
    title: "Annual Update of the HHS Poverty Guidelines (2025)",
    url: "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines",
    note: "Effective January 17, 2025. Verify against the Federal Register notice when updating.",
  },
  standardPlan: {
    id: "standard-plan",
    title: "Standard Repayment Plan — StudentAid.gov",
    url: "https://studentaid.gov/manage-loans/repayment/plans/standard",
    note: "Fixed payments over up to 10 years; $50 minimum monthly payment.",
  },
  ibr: {
    id: "ibr-34cfr685-221",
    title: "Income-Based Repayment (IBR), 34 CFR 685.221",
    url: "https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-685/subpart-B/section-685.221",
    note: "15% of discretionary income (25-yr forgiveness); 10% and 20-yr forgiveness for new borrowers on or after July 1, 2014. Discretionary income = AGI minus 150% of the poverty guideline.",
  },
  rap: {
    id: "rap-pl-119-21",
    title: "Repayment Assistance Plan (RAP), Pub. L. 119-21 (July 4, 2025)",
    url: "https://studentaid.gov/announcements-events/repayment-assistance-plan",
    note: "Launched July 1, 2026. Payment is an AGI-tiered percentage (1%-10%), minus $50/month per dependent, $10/month minimum; forgiveness after 360 qualifying payments; unpaid accrued interest is not charged.",
  },
  pslf: {
    id: "pslf-34cfr685-219",
    title: "Public Service Loan Forgiveness, 34 CFR 685.219",
    url: "https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-685/subpart-B/section-685.219",
    note: "120 qualifying payments on Direct Loans while employed full-time by a qualifying public service employer.",
  },
  myAidData: {
    id: "studentaid-my-aid-data",
    title: "StudentAid.gov — My Aid Data export",
    url: "https://studentaid.gov/fsa-id/sign-in",
    note: "Borrower-downloaded aid file; parsed locally on the user's device, never uploaded.",
  },
} as const satisfies Record<string, Citation>;
