import type { Stage } from "../state.js";

const STAGES: Array<{
  id: Stage;
  title: string;
  audience: string;
  blurb: string;
  emoji: string;
}> = [
  {
    id: "apply",
    title: "Apply",
    audience: "I'm applying to college",
    blurb: "A deadline-by-deadline application checklist, from the college list to decision day.",
    emoji: "📝",
  },
  {
    id: "afford",
    title: "Afford",
    audience: "I need to pay for college",
    blurb: "Compare award letters on real net price — see which offer actually costs less.",
    emoji: "🧮",
  },
  {
    id: "repay",
    title: "Repay",
    audience: "I'm repaying student loans",
    blurb: "Match your loans to a repayment plan (Standard, IBR, RAP) and screen for PSLF.",
    emoji: "🎓",
  },
];

export function Home(props: { onSelect: (stage: Stage) => void }) {
  return (
    <div className="card">
      <h1>Where are you on the path?</h1>
      <p className="hint">
        Free, nonprofit guidance for every stage of paying for college. Pick the
        one that fits today — your progress in each is saved on this device.
      </p>
      <div className="stage-cards">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="stage-card"
            onClick={() => props.onSelect(s.id)}
          >
            <span className="stage-emoji" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="stage-text">
              <strong>{s.audience}</strong>
              <span className="stage-blurb">{s.blurb}</span>
            </span>
            <span className="stage-go" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
