import type { EmployerType, ParsedLoan } from "@gradpath/engine";

export interface Profile {
  agi: number;
  familySize: number;
  dependents: number;
  state: string;
  newBorrowerOnOrAfterJuly2014: boolean;
  pursuingPslf: boolean;
  employerType: EmployerType;
  hoursPerWeek: number;
  qualifyingPayments: number;
}

export const DEFAULT_PROFILE: Profile = {
  agi: 40_000,
  familySize: 1,
  dependents: 0,
  state: "",
  newBorrowerOnOrAfterJuly2014: false,
  pursuingPslf: false,
  employerType: "nonprofit-501c3",
  hoursPerWeek: 40,
  qualifyingPayments: 0,
};

export interface AppState {
  step: 0 | 1 | 2;
  profile: Profile;
  loans: ParsedLoan[];
}

// All persistence is on-device only (localStorage); nothing is sent anywhere.
const STORAGE_KEY = "gradpath-screening-v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as AppState;
      return {
        step: saved.step ?? 0,
        profile: { ...DEFAULT_PROFILE, ...saved.profile },
        loans: Array.isArray(saved.loans) ? saved.loans : [],
      };
    }
  } catch {
    /* corrupted or unavailable storage falls through to defaults */
  }
  return { step: 0, profile: DEFAULT_PROFILE, loans: [] };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the session still works, it just won't persist */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export const fmtUsd = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
