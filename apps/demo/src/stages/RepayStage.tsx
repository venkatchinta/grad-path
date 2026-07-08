import { ProfileStep } from "../steps/ProfileStep.js";
import { LoansStep } from "../steps/LoansStep.js";
import { ResultsStep } from "../steps/ResultsStep.js";
import type { AppState, Profile } from "../state.js";
import type { ParsedLoan } from "@gradpath/engine";

const STEP_LABELS = ["About you", "Your loans", "Results"] as const;

export function RepayStage(props: {
  step: AppState["step"];
  profile: Profile;
  loans: ParsedLoan[];
  setStep: (step: AppState["step"]) => void;
  setProfile: (p: Profile) => void;
  setLoans: (loans: ParsedLoan[]) => void;
  onStartOver: () => void;
}) {
  const { step, setStep } = props;
  return (
    <>
      <nav className="stepper" aria-label="Progress">
        <ol>
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              aria-current={step === i ? "step" : undefined}
              className={i < step ? "done" : i === step ? "current" : ""}
            >
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i as AppState["step"])}
              >
                <span className="step-num">{i + 1}</span> {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && (
        <ProfileStep
          profile={props.profile}
          onChange={props.setProfile}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <LoansStep
          loans={props.loans}
          onChange={props.setLoans}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <ResultsStep
          profile={props.profile}
          loans={props.loans}
          onBack={() => setStep(1)}
          onStartOver={props.onStartOver}
        />
      )}
    </>
  );
}
