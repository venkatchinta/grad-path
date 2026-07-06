import { useEffect, useState } from "react";
import { ProfileStep } from "./steps/ProfileStep.js";
import { LoansStep } from "./steps/LoansStep.js";
import { ResultsStep } from "./steps/ResultsStep.js";
import {
  clearState,
  loadState,
  saveState,
  type AppState,
  type Profile,
} from "./state.js";
import type { ParsedLoan } from "@gradpath/engine";

const STEP_LABELS = ["About you", "Your loans", "Results"] as const;

export function App() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setStep = (step: AppState["step"]) => setState((s) => ({ ...s, step }));
  const setProfile = (profile: Profile) => setState((s) => ({ ...s, profile }));
  const setLoans = (loans: ParsedLoan[]) => setState((s) => ({ ...s, loans }));

  const startOver = () => {
    clearState();
    setState(loadState());
  };

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-inner">
          <img src="/icon.svg" alt="" width={28} height={28} />
          <div>
            <strong>GradPath</strong>
            <span className="tagline">Repayment screening</span>
          </div>
        </div>
      </header>

      <nav className="stepper" aria-label="Progress">
        <ol>
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              aria-current={state.step === i ? "step" : undefined}
              className={i < state.step ? "done" : i === state.step ? "current" : ""}
            >
              <button
                type="button"
                disabled={i > state.step}
                onClick={() => setStep(i as AppState["step"])}
              >
                <span className="step-num">{i + 1}</span> {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <main>
        {state.step === 0 && (
          <ProfileStep
            profile={state.profile}
            onChange={setProfile}
            onNext={() => setStep(1)}
          />
        )}
        {state.step === 1 && (
          <LoansStep
            loans={state.loans}
            onChange={setLoans}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {state.step === 2 && (
          <ResultsStep
            profile={state.profile}
            loans={state.loans}
            onBack={() => setStep(1)}
            onStartOver={startOver}
          />
        )}
      </main>

      <footer className="privacy-footer">
        <p>
          🔒 Everything runs on your device. Your financial information is never
          uploaded, stored on a server, or shared. Free, nonprofit, open source —
          never sold to institutions.
        </p>
      </footer>
    </div>
  );
}
