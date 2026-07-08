import type { AwardLetterInput, EmployerType, ParsedLoan } from "@gradpath/engine";

export type Stage = "home" | "apply" | "afford" | "repay" | "auth" | "family";

export type Role = "student" | "parent";
export type Provider = "google" | "apple";

export interface MockUser {
  name: string;
  email: string;
  provider: Provider;
  role: Role;
}

export interface Invite {
  code: string;
  sentTo: string;
  status: "pending" | "accepted";
}

/**
 * DEMO MOCK: the whole auth/family model is simulated on-device to design the
 * workflow before building the real backend (ADR-004). Nothing is sent
 * anywhere; "sign-in" creates a local record only.
 */
export interface AuthState {
  user?: MockUser;
  /** Parent side: invites issued to students. */
  invites: Invite[];
  /** Student side: the family invite code this device accepted. */
  joinedFamilyCode?: string;
  /** Student consent: share progress summaries (never raw finances). */
  shareWithFamily: boolean;
}

export const DEFAULT_AUTH: AuthState = {
  invites: [],
  shareWithFamily: false,
};

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
  stage: Stage;
  /** Repay flow position. */
  step: 0 | 1 | 2;
  profile: Profile;
  loans: ParsedLoan[];
  /** Afford: award letters entered so far. */
  awardLetters: AwardLetterInput[];
  /** Apply: ids of completed checklist items. */
  applyDone: string[];
  auth: AuthState;
}

// All persistence is on-device only (localStorage); nothing is sent anywhere.
const STORAGE_KEY = "gradpath-screening-v1";

const DEFAULTS: AppState = {
  stage: "home",
  step: 0,
  profile: DEFAULT_PROFILE,
  loans: [],
  awardLetters: [],
  applyDone: [],
  auth: DEFAULT_AUTH,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      return {
        stage: saved.stage ?? "home",
        step: saved.step ?? 0,
        profile: { ...DEFAULT_PROFILE, ...saved.profile },
        loans: Array.isArray(saved.loans) ? saved.loans : [],
        awardLetters: Array.isArray(saved.awardLetters) ? saved.awardLetters : [],
        applyDone: Array.isArray(saved.applyDone) ? saved.applyDone : [],
        auth: { ...DEFAULT_AUTH, ...saved.auth },
      };
    }
  } catch {
    /* corrupted or unavailable storage falls through to defaults */
  }
  return structuredClone(DEFAULTS);
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

export const fmtUsd0 = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
