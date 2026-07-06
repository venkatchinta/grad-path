import { useMemo } from "react";
import { recommend, summarizeLoans, type ParsedLoan } from "@gradpath/engine";
import { fmtUsd, type Profile } from "../state.js";

export function ResultsStep(props: {
  profile: Profile;
  loans: ParsedLoan[];
  onBack: () => void;
  onStartOver: () => void;
}) {
  const { profile, loans } = props;

  const result = useMemo(() => {
    const summary = summarizeLoans(loans);
    return recommend({
      borrower: {
        agi: profile.agi,
        familySize: profile.familySize,
        dependents: profile.dependents,
        state: profile.state || undefined,
        newBorrowerOnOrAfterJuly2014: profile.newBorrowerOnOrAfterJuly2014,
      },
      loans: summary,
      parsedLoans: loans,
      pslf: profile.pursuingPslf
        ? {
            employerType: profile.employerType,
            hoursPerWeek: profile.hoursPerWeek,
            loanPrograms: [...new Set(loans.map((l) => l.program))],
            qualifyingPayments: profile.qualifyingPayments,
            onQualifyingPlan: true,
          }
        : undefined,
    });
  }, [profile, loans]);

  const pslf = result.pslf;

  return (
    <div className="card">
      <h1>Your options</h1>

      {result.escalations.length > 0 && (
        <section className="escalations" role="alert">
          <h2>⚠️ Talk to a human first</h2>
          <ul>
            {result.escalations.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Estimated monthly payment by plan</h2>
        <div className="plan-tiles">
          {result.plans.map((plan) => (
            <article
              key={plan.plan}
              className={`plan-tile${plan.plan === result.lowestPaymentPlan ? " lowest" : ""}`}
            >
              <header>
                <h3>{plan.label}</h3>
                {plan.plan === result.lowestPaymentPlan && (
                  <span className="chip">Lowest payment</span>
                )}
              </header>
              <p className="hero-figure">
                {fmtUsd(plan.monthlyPayment)}
                <span className="per">/mo</span>
              </p>
              <p className="term">
                {plan.forgivenessAfterMonths
                  ? `Forgiveness after ${plan.forgivenessAfterMonths / 12} years of qualifying payments`
                  : `Paid off in up to ${plan.termMonths / 12} years`}
              </p>
              <details>
                <summary>How this was calculated</summary>
                <ul>
                  {plan.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                  {plan.citations.map((c) => (
                    <li key={c.id}>
                      Source:{" "}
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      </section>

      {pslf && (
        <section>
          <h2>PSLF progress</h2>
          {pslf.eligible ? (
            <p className="pslf-line">
              ✅ You screen as eligible. <strong>{pslf.qualifyingPayments} of 120</strong>{" "}
              qualifying payments — {pslf.paymentsRemaining} to go.
            </p>
          ) : (
            <p className="pslf-line">
              Blockers found — payments may not count until these are fixed.
            </p>
          )}
          <div
            className="meter"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={120}
            aria-valuenow={Math.min(120, pslf.qualifyingPayments)}
            aria-label="Qualifying payments toward 120"
          >
            <div className="meter-fill" style={{ width: `${pslf.progress * 100}%` }} />
          </div>
          {pslf.blockers.length > 0 && (
            <ul className="warnings">
              {pslf.blockers.map((b) => (
                <li key={b}>⛔ {b}</li>
              ))}
            </ul>
          )}
          {pslf.warnings.length > 0 && (
            <ul className="warnings">
              {pslf.warnings.map((w) => (
                <li key={w}>⚠️ {w}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2>Next steps</h2>
        <ol className="next-steps">
          {result.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="sources">
        <h2>Sources</h2>
        <ul>
          {result.citations.map((c) => (
            <li key={c.id}>
              <a href={c.url} target="_blank" rel="noreferrer">
                {c.title}
              </a>
              {c.note ? <span className="hint"> — {c.note}</span> : null}
            </li>
          ))}
        </ul>
        <p className="hint">
          This is a screening estimate, not financial advice or an official
          determination. Verify with your servicer and StudentAid.gov.
        </p>
      </section>

      <div className="actions">
        <button type="button" onClick={props.onBack}>
          ← Back
        </button>
        <button type="button" className="ghost" onClick={props.onStartOver}>
          Start over (clears saved data)
        </button>
      </div>
    </div>
  );
}
