import { useMemo, useState } from "react";
import {
  planFunding,
  type AwardLetterInput,
  type FundingKind,
  type FundingSource,
} from "@gradpath/engine";
import { fmtUsd0 } from "../state.js";

const KIND_OPTIONS: Array<{ value: FundingKind; label: string }> = [
  { value: "529", label: "529 plan balance" },
  { value: "savings", label: "Savings / cash" },
  { value: "monthly-contribution", label: "Monthly contribution (per month)" },
  { value: "personal-loan", label: "Personal loan / HELOC" },
  { value: "other", label: "Other one-time funds" },
];

const OWNER_OPTIONS = ["parent", "student", "grandparent", "other"] as const;

export function FundingPlan(props: {
  letters: AwardLetterInput[];
  netPriceBySchool: Map<string, number>;
  sources: FundingSource[];
  onChange: (sources: FundingSource[]) => void;
}) {
  const schools = [...props.netPriceBySchool.keys()];
  const [school, setSchool] = useState(schools[0] ?? "");
  const [form, setForm] = useState({
    kind: "529" as FundingKind,
    label: "",
    amount: "",
    owner: "parent" as (typeof OWNER_OPTIONS)[number],
  });

  const selectedSchool = schools.includes(school) ? school : schools[0];
  const annualNetPrice = props.netPriceBySchool.get(selectedSchool) ?? 0;

  const result = useMemo(
    () =>
      selectedSchool && props.sources.length > 0
        ? planFunding({ annualNetPrice, sources: props.sources })
        : undefined,
    [selectedSchool, annualNetPrice, props.sources],
  );

  const addSource = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.max(0, Number(form.amount) || 0);
    if (amount === 0) return;
    const fallback = KIND_OPTIONS.find((k) => k.value === form.kind)?.label ?? form.kind;
    props.onChange([
      ...props.sources,
      { kind: form.kind, label: form.label.trim() || fallback, amount, owner: form.owner },
    ]);
    setForm({ ...form, label: "", amount: "" });
  };

  const remove = (index: number) =>
    props.onChange(props.sources.filter((_, i) => i !== index));

  return (
    <section>
      <h2>Family funding plan</h2>
      <p className="hint">
        Can your family cover it? Add what you have — 529 plans, savings, what
        you can chip in monthly — and see the gap for four years. Amounts stay
        on this device and are never shared, even with family sharing on.
      </p>

      {schools.length > 1 && (
        <label>
          Planning for
          <select value={selectedSchool} onChange={(e) => setSchool(e.target.value)}>
            {schools.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}

      <form onSubmit={addSource}>
        <div className="field-row manual-row">
          <label>
            Source
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as FundingKind })}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Whose
            <select
              value={form.owner}
              onChange={(e) =>
                setForm({ ...form, owner: e.target.value as (typeof OWNER_OPTIONS)[number] })
              }
            >
              {OWNER_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label>
            Amount ($)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={form.kind === "monthly-contribution" ? "300 /mo" : "20000"}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <button type="submit">Add</button>
        </div>
      </form>

      {props.sources.length > 0 && (
        <div className="table-scroll">
          <table className="ledger">
            <tbody>
              {props.sources.map((s, i) => (
                <tr key={`${s.label}-${i}`}>
                  <td>
                    {s.label}
                    <span className="status"> · {s.owner}</span>
                  </td>
                  <td className="num">
                    {fmtUsd0(s.amount)}
                    {s.kind === "monthly-contribution" ? "/mo" : ""}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ghost"
                      aria-label={`Remove ${s.label}`}
                      onClick={() => remove(i)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && (
        <>
          <p className="pslf-line">
            <strong>{Math.round(result.coverageRatio * 100)}%</strong> of the{" "}
            {result.years}-year cost at {selectedSchool} is covered without
            borrowing.
          </p>
          <div
            className="meter"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(result.coverageRatio * 100)}
            aria-label="Cost covered without borrowing"
          >
            <div className="meter-fill" style={{ width: `${result.coverageRatio * 100}%` }} />
          </div>

          <table className="ledger breakdown">
            <tbody>
              <tr>
                <td>{result.years}-year cost (net price × {result.years})</td>
                <td className="num">{fmtUsd0(result.totalCost)}</td>
              </tr>
              <tr>
                <td>Funds without borrowing</td>
                <td className="num">−{fmtUsd0(result.fundsAvailable)}</td>
              </tr>
              <tr>
                <td>Federal student loans (within limits)</td>
                <td className="num">−{fmtUsd0(result.federalLoansNeeded)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Still to solve</strong>
                </td>
                <td className="num">
                  <strong>{fmtUsd0(result.gapAfterFederalLoans)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {result.warnings.length > 0 && (
            <ul className="warnings">
              {result.warnings.map((w) => (
                <li key={w}>⚠️ {w}</li>
              ))}
            </ul>
          )}

          <div className="sources">
            <h2>Funding plan sources</h2>
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
          </div>
        </>
      )}
    </section>
  );
}
