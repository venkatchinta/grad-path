// @gradpath/engine
//
// Deterministic, citation-backed calculation and eligibility logic for the
// Repay stage. No AI is used in this layer — every rule here should trace
// back to an official source (StudentAid.gov, federal poverty guidelines,
// etc.). AI-driven conversation and guidance lives outside this package.

export const GRADPATH_ENGINE_VERSION = "0.1.0";

export { CITATIONS, type Citation } from "./citations.js";
export {
  povertyGuideline,
  regionForState,
  LATEST_GUIDELINE_YEAR,
  type PovertyRegion,
  type PovertyGuidelineResult,
} from "./poverty-guidelines.js";
export {
  standardPayment,
  ibrPayment,
  rapPayment,
  rapBaseAnnualAmount,
  comparePlans,
  type BorrowerFinances,
  type LoanSummary,
  type PlanResult,
} from "./payment-plans.js";
export {
  screenPslf,
  type EmployerType,
  type LoanProgram,
  type PslfInput,
  type PslfScreenResult,
} from "./pslf.js";
export {
  parseMyAidData,
  summarizeLoans,
  classifyLoanProgram,
  type ParsedLoan,
  type ParseResult,
} from "./parsers.js";
export {
  recommend,
  type Recommendation,
  type RecommendationInput,
} from "./recommend.js";
export {
  planFunding,
  dependentFederalLoanCapacity,
  type FundingKind,
  type FundingSource,
  type FundingPlanInput,
  type FundingPlanResult,
} from "./budget.js";
export {
  analyzeAwardLetter,
  compareAwardLetters,
  DEPENDENT_UNDERGRAD_LOAN_LIMITS,
  type AwardLetterInput,
  type AwardAnalysis,
  type AwardComparison,
} from "./afford.js";
