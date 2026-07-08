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
  netPrice: {
    id: "net-price-hea-132",
    title: "Net price definition, HEA §132 / College Scoring — StudentAid.gov",
    url: "https://studentaid.gov/complete-aid-process/how-calculated",
    note: "Net price = cost of attendance minus gift aid (grants and scholarships). Loans and work-study are not gift aid — they are money you repay or earn.",
  },
  loanLimits: {
    id: "loan-limits-34cfr685-203",
    title: "Direct Loan annual/aggregate limits, 34 CFR 685.203",
    url: "https://studentaid.gov/understand-aid/types/loans/subsidized-unsubsidized",
    note: "Dependent undergraduates: $5,500 year 1, $6,500 year 2, $7,500 years 3+; $31,000 aggregate (max $23,000 subsidized). Borrowing beyond these limits requires Parent PLUS or private loans.",
  },
  awardLetterCompare: {
    id: "cfpb-grad-path",
    title: "Your Financial Path to Graduation — Consumer Financial Protection Bureau",
    url: "https://www.consumerfinance.gov/paying-for-college/your-financial-path-to-graduation/",
    note: "Award letters are not standardized; some blend loans into 'total aid'. Compare offers on net price, not on the headline award total.",
  },
  myAidData: {
    id: "studentaid-my-aid-data",
    title: "StudentAid.gov — My Aid Data export",
    url: "https://studentaid.gov/fsa-id/sign-in",
    note: "Borrower-downloaded aid file; parsed locally on the user's device, never uploaded.",
  },
} as const satisfies Record<string, Citation>;
