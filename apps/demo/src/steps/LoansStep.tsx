import { useRef, useState } from "react";
import {
  classifyLoanProgram,
  parseMyAidData,
  summarizeLoans,
  type ParsedLoan,
} from "@gradpath/engine";
import { fmtUsd } from "../state.js";

const LOAN_TYPES = [
  "Direct Subsidized Loan",
  "Direct Unsubsidized Loan",
  "Direct Consolidation Loan",
  "Direct Grad PLUS Loan",
  "Parent PLUS Loan",
  "FFEL Stafford Loan",
  "Perkins Loan",
  "Private Loan",
];

export function LoansStep(props: {
  loans: ParsedLoan[];
  onChange: (loans: ParsedLoan[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { loans, onChange } = props;
  const [warnings, setWarnings] = useState<string[]>([]);
  const [manual, setManual] = useState({ type: LOAN_TYPES[1], balance: "", rate: "" });
  const fileInput = useRef<HTMLInputElement>(null);

  const importText = (text: string) => {
    const result = parseMyAidData(text);
    setWarnings(result.warnings);
    if (result.loans.length > 0) onChange([...loans, ...result.loans]);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importText(await file.text());
    e.target.value = "";
  };

  const addManual = () => {
    const balance = Number(manual.balance);
    let rate = Number(manual.rate);
    if (!Number.isFinite(balance) || balance <= 0) return;
    if (rate > 1) rate = rate / 100;
    onChange([
      ...loans,
      {
        program: classifyLoanProgram(manual.type),
        typeDescription: manual.type,
        balance,
        interestRate: Number.isFinite(rate) ? rate : 0,
      },
    ]);
    setManual({ ...manual, balance: "", rate: "" });
  };

  const remove = (index: number) => onChange(loans.filter((_, i) => i !== index));
  const summary = summarizeLoans(loans);

  return (
    <div className="card">
      <h1>Your loans</h1>

      <section className="import-box">
        <h2>Import from StudentAid.gov</h2>
        <p className="hint">
          Download your <em>“My Aid Data”</em> file (JSON) from StudentAid.gov,
          then load it here. <strong>The file is read on your device only — it is
          never uploaded.</strong>
        </p>
        <input
          ref={fileInput}
          type="file"
          accept=".json,.txt,application/json,text/plain"
          onChange={onFile}
          hidden
        />
        <button type="button" onClick={() => fileInput.current?.click()}>
          Load “My Aid Data” file
        </button>
        {warnings.length > 0 && (
          <ul className="warnings" role="status">
            {warnings.map((w) => (
              <li key={w}>⚠️ {w}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Or add loans manually</h2>
        <div className="field-row manual-row">
          <label>
            Loan type
            <select
              value={manual.type}
              onChange={(e) => setManual({ ...manual, type: e.target.value })}
            >
              {LOAN_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Balance ($)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="20000"
              value={manual.balance}
              onChange={(e) => setManual({ ...manual, balance: e.target.value })}
            />
          </label>
          <label>
            Rate (%)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={20}
              step={0.01}
              placeholder="6.5"
              value={manual.rate}
              onChange={(e) => setManual({ ...manual, rate: e.target.value })}
            />
          </label>
          <button type="button" onClick={addManual}>
            Add
          </button>
        </div>
      </section>

      {loans.length > 0 && (
        <section>
          <h2>Loan ledger</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Loan</th>
                <th scope="col" className="num">Balance</th>
                <th scope="col" className="num">Rate</th>
                <th scope="col">
                  <span className="visually-hidden">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => (
                <tr key={`${loan.typeDescription}-${i}`}>
                  <td>
                    {loan.typeDescription}
                    {loan.status ? <span className="status"> · {loan.status}</span> : null}
                  </td>
                  <td className="num">{fmtUsd(loan.balance)}</td>
                  <td className="num">{(loan.interestRate * 100).toFixed(2)}%</td>
                  <td>
                    <button
                      type="button"
                      className="ghost"
                      aria-label={`Remove ${loan.typeDescription}`}
                      onClick={() => remove(i)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total ({loans.length} loans)</th>
                <td className="num">{fmtUsd(summary.balance)}</td>
                <td className="num">{(summary.interestRate * 100).toFixed(2)}%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>
      )}

      <div className="actions">
        <button type="button" onClick={props.onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="primary"
          disabled={loans.length === 0}
          onClick={props.onNext}
        >
          See my options →
        </button>
      </div>
    </div>
  );
}
