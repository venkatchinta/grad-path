// @gradpath/engine
//
// Deterministic, citation-backed calculation and eligibility logic for the
// Repay stage. No AI is used in this layer — every rule here should trace
// back to an official source (StudentAid.gov, federal poverty guidelines,
// etc.). AI-driven conversation and guidance lives outside this package.
//
// Planned modules:
//   - poverty-guidelines: federal poverty guideline lookups by household size/state
//   - payment-plans: Standard 10-year, IBR, and RAP payment calculators
//   - pslf: Public Service Loan Forgiveness eligibility screening
//   - parsers: tolerant parser for StudentAid.gov "My Aid Data" exports
//   - recommend: recommendation engine with expert-escalation logic

export const GRADPATH_ENGINE_VERSION = "0.1.0";
