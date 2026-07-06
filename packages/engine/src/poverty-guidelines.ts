import { CITATIONS, type Citation } from "./citations.js";

// Federal poverty guidelines, kept as a versioned data table so annual updates
// are a data change (with a new citation), not a logic change.
//
// UPDATE PROCESS: when HHS publishes the annual notice (typically mid-January),
// add a new year entry below, add a citation in citations.ts pointing at the
// Federal Register notice, and extend the tests with the published figures.

export type PovertyRegion = "contiguous" | "alaska" | "hawaii";

interface GuidelineTable {
  /** First-person amount and per-additional-person increment, by region. */
  regions: Record<PovertyRegion, { base: number; perAdditionalPerson: number }>;
  citation: Citation;
}

const TABLES: Record<number, GuidelineTable> = {
  2025: {
    regions: {
      contiguous: { base: 15_650, perAdditionalPerson: 5_500 },
      alaska: { base: 19_550, perAdditionalPerson: 6_880 },
      hawaii: { base: 17_990, perAdditionalPerson: 6_320 },
    },
    citation: CITATIONS.hhsPoverty2025,
  },
};

export const LATEST_GUIDELINE_YEAR = Math.max(
  ...Object.keys(TABLES).map(Number),
);

/** Map a two-letter state/territory code to its poverty-guideline region. */
export function regionForState(stateCode: string): PovertyRegion {
  const code = stateCode.trim().toUpperCase();
  if (code === "AK") return "alaska";
  if (code === "HI") return "hawaii";
  return "contiguous";
}

export interface PovertyGuidelineResult {
  year: number;
  region: PovertyRegion;
  householdSize: number;
  /** Annual guideline amount in dollars. */
  amount: number;
  citations: Citation[];
}

export function povertyGuideline(input: {
  householdSize: number;
  region?: PovertyRegion;
  state?: string;
  year?: number;
}): PovertyGuidelineResult {
  const year = input.year ?? LATEST_GUIDELINE_YEAR;
  const table = TABLES[year];
  if (!table) {
    throw new RangeError(
      `No poverty guideline table for ${year} (have: ${Object.keys(TABLES).join(", ")})`,
    );
  }
  if (!Number.isInteger(input.householdSize) || input.householdSize < 1) {
    throw new RangeError("householdSize must be an integer >= 1");
  }
  const region =
    input.region ?? (input.state ? regionForState(input.state) : "contiguous");
  const { base, perAdditionalPerson } = table.regions[region];
  return {
    year,
    region,
    householdSize: input.householdSize,
    amount: base + perAdditionalPerson * (input.householdSize - 1),
    citations: [table.citation],
  };
}
