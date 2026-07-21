import { useEffect, useState } from "react";
import { Home } from "./stages/Home.js";
import { ApplyStage } from "./stages/ApplyStage.js";
import { AffordStage } from "./stages/AffordStage.js";
import { RepayStage } from "./stages/RepayStage.js";
import { AuthScreen } from "./stages/AuthScreen.js";
import { FamilyStage } from "./stages/FamilyStage.js";
import {
  clearState,
  loadState,
  saveState,
  type AppState,
  type AuthState,
  type Profile,
  type Stage,
} from "./state.js";
import type { AwardLetterInput, ParsedLoan } from "@gradpath/engine";

const STAGE_TAGLINES: Record<Stage, string> = {
  home: "Apply · Afford · Repay",
  apply: "Apply — application checklist",
  afford: "Afford — compare award letters",
  repay: "Repay — repayment screening",
  auth: "Your account",
  family: "Family tracking",
};

const APPLY_TOTAL = 15;

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
  const setAuth = (auth: AuthState) => setState((s) => ({ ...s, auth }));

  const startOver = () => {
    clearState();
    setState(loadState());
  };

  const user = state.auth.user;

  return (
    <div className="app">
      <div className="beta-banner" role="note">
        <strong>Private beta.</strong> These are screening estimates under expert
        review — not financial advice or an official determination. Always verify
        with StudentAid.gov and your servicer.
      </div>
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
          <div className="masthead-title">
            <strong>GradPath</strong>
            <span className="tagline">{STAGE_TAGLINES[state.stage]}</span>
          </div>
          <button
            type="button"
            className="account-btn"
            onClick={() => setStage(user ? "family" : "auth")}
          >
            {user ? user.name.split(" ")[0] : "Sign in"}
          </button>
        </div>
      </header>

      <main>
        {state.stage === "home" && (
          <>
            <Home onSelect={setStage} />
            <div className="card family-teaser">
              {user ? (
                <p>
                  {user.role === "parent" ? "👨‍👧" : "🎒"} Signed in as{" "}
                  <strong>{user.name}</strong> ({user.role}).{" "}
                  <button type="button" className="inline-link" onClick={() => setStage("family")}>
                    {user.role === "parent"
                      ? "Open your family dashboard →"
                      : "Manage family sharing →"}
                  </button>
                </p>
              ) : (
                <p>
                  👨‍👧 Going through this as a family?{" "}
                  <button type="button" className="inline-link" onClick={() => setStage("auth")}>
                    Sign in to invite your student and track progress together →
                  </button>
                </p>
              )}
            </div>
          </>
        )}
        {state.stage === "auth" && (
          <AuthScreen
            auth={state.auth}
            onChange={setAuth}
            onDone={(role) => setStage(role === "parent" ? "family" : "home")}
          />
        )}
        {state.stage === "family" && (
          <FamilyStage
            auth={state.auth}
            selfProgress={{
              applyDone: state.applyDone.length,
              applyTotal: APPLY_TOTAL,
              affordSchools: state.awardLetters.length,
              repayScreened: state.loans.length > 0,
            }}
            onChange={setAuth}
            onSignIn={() => setStage("auth")}
          />
        )}
        {state.stage === "apply" && (
          <ApplyStage
            done={state.applyDone}
            onChange={setApplyDone}
            onGoAfford={() => setStage("afford")}
          />
        )}
        {state.stage === "afford" && (
          <AffordStage
            letters={state.awardLetters}
            onChange={setAwardLetters}
            fundingSources={state.fundingSources}
            onFundingChange={(fundingSources) =>
              setState((s) => ({ ...s, fundingSources }))
            }
          />
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
