import { useMemo, useState } from "react";
import {
  compareAwardLetters,
  type AwardLetterInput,
  type FundingSource,
} from "@gradpath/engine";
import { FundingPlan } from "./FundingPlan.js";
import { fmtUsd0 } from "../state.js";

const EMPTY_FORM = {
  school: "",
  tuitionAndFees: "",
  housingAndFood: "",
  otherCosts: "",
  giftAid: "",
  loansOffered: "",
  workStudy: "",
};

export function AffordStage(props: {
  letters: AwardLetterInput[];
  onChange: (letters: AwardLetterInput[]) => void;
  fundingSources: FundingSource[];
  onFundingChange: (sources: FundingSource[]) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const num = (v: string) => Math.max(0, Number(v) || 0);

  const addSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.school.trim()) return;
    props.onChange([
      ...props.letters,
      {
        school: form.school.trim(),
        costOfAttendance: {
          tuitionAndFees: num(form.tuitionAndFees),
          housingAndFood: num(form.housingAndFood),
          otherCosts: num(form.otherCosts),
        },
        giftAid: num(form.giftAid),
        loansOffered: num(form.loansOffered),
        workStudy: num(form.workStudy),
      },
    ]);
    setForm(EMPTY_FORM);
  };

  const remove = (school: string) =>
    props.onChange(props.letters.filter((l) => l.school !== school));

  const comparison = useMemo(
    () => (props.letters.length > 0 ? compareAwardLetters(props.letters) : undefined),
    [props.letters],
  );

  return (
    <div className="card">
      <h1>Compare award letters</h1>
      <p className="hint">
        Enter each school's offer from its financial aid letter. The number that
        matters is <strong>net price</strong> — cost minus free money. Loans are
        not a discount.
      </p>

      <form onSubmit={addSchool}>
        <h2>Add a school's offer (per year)</h2>
        <label>
          School name
          <input
            type="text"
            value={form.school}
            placeholder="e.g. State University"
            onChange={(e) => setForm({ ...form, school: e.target.value })}
            required
          />
        </label>
        <div className="field-row">
          <label>
            Tuition & fees ($)
            <input type="number" inputMode="numeric" min={0} value={form.tuitionAndFees} placeholder="12000" onChange={(e) => setForm({ ...form, tuitionAndFees: e.target.value })} required />
          </label>
          <label>
            Housing & food ($)
            <input type="number" inputMode="numeric" min={0} value={form.housingAndFood} placeholder="13000" onChange={(e) => setForm({ ...form, housingAndFood: e.target.value })} />
          </label>
          <label>
            Other costs ($)
            <input type="number" inputMode="numeric" min={0} value={form.otherCosts} placeholder="3000" onChange={(e) => setForm({ ...form, otherCosts: e.target.value })} />
          </label>
        </div>
        <div className="field-row">
          <label>
            Grants + scholarships ($)
            <input type="number" inputMode="numeric" min={0} value={form.giftAid} placeholder="10000" onChange={(e) => setForm({ ...form, giftAid: e.target.value })} />
          </label>
          <label>
            Loans offered ($)
            <input type="number" inputMode="numeric" min={0} value={form.loansOffered} placeholder="5500" onChange={(e) => setForm({ ...form, loansOffered: e.target.value })} />
          </label>
          <label>
            Work-study ($)
            <input type="number" inputMode="numeric" min={0} value={form.workStudy} placeholder="2000" onChange={(e) => setForm({ ...form, workStudy: e.target.value })} />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            Add school
          </button>
        </div>
      </form>

      {comparison && (
        <>
          <section>
            <h2>Offers ranked by net price</h2>
            <div className="plan-tiles">
              {comparison.analyses.map((a) => (
                <article
                  key={a.school}
                  className={`plan-tile${a.school === comparison.lowestNetPriceSchool && comparison.analyses.length > 1 ? " lowest" : ""}`}
                >
                  <header>
                    <h3>{a.school}</h3>
                    {a.school === comparison.lowestNetPriceSchool &&
                      comparison.analyses.length > 1 && (
                        <span className="chip">Lowest net price</span>
                      )}
                  </header>
                  <p className="hero-figure">
                    {fmtUsd0(a.netPrice)}
                    <span className="per">/yr net price</span>
                  </p>
                  <table className="ledger breakdown">
                    <tbody>
                      <tr>
                        <td>Cost of attendance</td>
                        <td className="num">{fmtUsd0(a.costOfAttendance)}</td>
                      </tr>
                      <tr>
                        <td>Grants + scholarships</td>
                        <td className="num">−{fmtUsd0(a.giftAid)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Net price</strong>
                        </td>
                        <td className="num">
                          <strong>{fmtUsd0(a.netPrice)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Loans offered (repaid later)</td>
                        <td className="num">−{fmtUsd0(a.loansOffered)}</td>
                      </tr>
                      <tr>
                        <td>Work-study (earned)</td>
                        <td className="num">−{fmtUsd0(a.workStudy)}</td>
                      </tr>
                      <tr>
                        <td>Out of pocket now</td>
                        <td className="num">{fmtUsd0(a.outOfPocket)}</td>
                      </tr>
                    </tbody>
                  </table>
                  {a.warnings.length > 0 && (
                    <ul className="warnings">
                      {a.warnings.map((w) => (
                        <li key={w}>⚠️ {w}</li>
                      ))}
                    </ul>
                  )}
                  <button type="button" className="ghost" onClick={() => remove(a.school)}>
                    ✕ Remove {a.school}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Four-year borrowing outlook</h2>
            <table className="ledger">
              <thead>
                <tr>
                  <th scope="col">School</th>
                  <th scope="col" className="num">Loans × 4 years</th>
                </tr>
              </thead>
              <tbody>
                {comparison.fourYearBorrowing.map((f) => (
                  <tr key={f.school}>
                    <td>
                      {f.school}
                      {f.exceedsAggregateLimit && (
                        <span className="status"> · exceeds the $31,000 federal undergrad limit — the gap means Parent PLUS or private loans</span>
                      )}
                    </td>
                    <td className="num">{fmtUsd0(f.projected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <FundingPlan
            letters={props.letters}
            netPriceBySchool={
              new Map(comparison.analyses.map((a) => [a.school, a.netPrice]))
            }
            sources={props.fundingSources}
            onChange={props.onFundingChange}
          />

          <section className="sources">
            <h2>Sources</h2>
            <ul>
              {comparison.citations.map((c) => (
                <li key={c.id}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.title}
                  </a>
                  {c.note ? <span className="hint"> — {c.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
