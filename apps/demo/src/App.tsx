import { useEffect, useState } from "react";
import { Home } from "./stages/Home.js";
import { ApplyStage } from "./stages/ApplyStage.js";
import { AffordStage } from "./stages/AffordStage.js";
import { RepayStage } from "./stages/RepayStage.js";
import {
  clearState,
  loadState,
  saveState,
  type AppState,
  type Profile,
  type Stage,
} from "./state.js";
import type { AwardLetterInput, ParsedLoan } from "@gradpath/engine";

const STAGE_TAGLINES: Record<Stage, string> = {
  home: "Apply · Afford · Repay",
  apply: "Apply — application checklist",
  afford: "Afford — compare award letters",
  repay: "Repay — repayment screening",
};

export function App() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setStage = (stage: Stage) => setState((s) => ({ ...s, stage }));
  const setStep = (step: AppState["step"]) => setState((s) => ({ ...s, step }));
  const setProfile = (profile: Profile) => setState((s) => ({ ...s, profile }));
  const setLoans = (loans: ParsedLoan[]) => setState((s) => ({ ...s, loans }));
  const setAwardLetters = (awardLetters: AwardLetterInput[]) =>
    setState((s) => ({ ...s, awardLetters }));
  const setApplyDone = (applyDone: string[]) => setState((s) => ({ ...s, applyDone }));

  const startOver = () => {
    clearState();
    setState(loadState());
  };

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-inner">
          {state.stage !== "home" && (
            <button
              type="button"
              className="home-btn"
              aria-label="Back to stage overview"
              onClick={() => setStage("home")}
            >
              ←
            </button>
          )}
          <img src="/icon.svg" alt="" width={28} height={28} />
          <div>
            <strong>GradPath</strong>
            <span className="tagline">{STAGE_TAGLINES[state.stage]}</span>
          </div>
        </div>
      </header>

      <main>
        {state.stage === "home" && <Home onSelect={setStage} />}
        {state.stage === "apply" && (
          <ApplyStage
            done={state.applyDone}
            onChange={setApplyDone}
            onGoAfford={() => setStage("afford")}
          />
        )}
        {state.stage === "afford" && (
          <AffordStage letters={state.awardLetters} onChange={setAwardLetters} />
        )}
        {state.stage === "repay" && (
          <RepayStage
            step={state.step}
            profile={state.profile}
            loans={state.loans}
            setStep={setStep}
            setProfile={setProfile}
            setLoans={setLoans}
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
