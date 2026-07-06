import type { EmployerType } from "@gradpath/engine";
import type { Profile } from "../state.js";

const EMPLOYER_OPTIONS: Array<{ value: EmployerType; label: string }> = [
  { value: "government", label: "Government (federal, state, local, tribal, military)" },
  { value: "nonprofit-501c3", label: "501(c)(3) nonprofit" },
  { value: "nonprofit-other", label: "Other nonprofit" },
  { value: "for-profit", label: "For-profit / private company" },
];

export function ProfileStep(props: {
  profile: Profile;
  onChange: (p: Profile) => void;
  onNext: () => void;
}) {
  const { profile, onChange } = props;
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    onChange({ ...profile, [key]: value });

  const num =
    (key: "agi" | "familySize" | "dependents" | "hoursPerWeek" | "qualifyingPayments") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, Math.max(0, Number(e.target.value) || 0));

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        props.onNext();
      }}
    >
      <h1>About you</h1>
      <p className="hint">
        Numbers from your latest tax return work best. Nothing here leaves your
        device.
      </p>

      <label>
        Adjusted gross income (AGI, per year)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={500}
          value={profile.agi}
          onChange={num("agi")}
          required
        />
      </label>

      <div className="field-row">
        <label>
          Family size
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={profile.familySize}
            onChange={(e) => set("familySize", Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label>
          Dependents
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={profile.dependents}
            onChange={num("dependents")}
          />
        </label>
        <label>
          State
          <input
            type="text"
            maxLength={2}
            placeholder="e.g. CA"
            autoCapitalize="characters"
            value={profile.state}
            onChange={(e) => set("state", e.target.value.toUpperCase())}
          />
        </label>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={profile.newBorrowerOnOrAfterJuly2014}
          onChange={(e) => set("newBorrowerOnOrAfterJuly2014", e.target.checked)}
        />
        My first federal loan was disbursed on or after July 1, 2014 (with no
        older balance outstanding)
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={profile.pursuingPslf}
          onChange={(e) => set("pursuingPslf", e.target.checked)}
        />
        Screen me for Public Service Loan Forgiveness (PSLF)
      </label>

      {profile.pursuingPslf && (
        <fieldset className="pslf-fields">
          <legend>PSLF details</legend>
          <label>
            Employer type
            <select
              value={profile.employerType}
              onChange={(e) => set("employerType", e.target.value as EmployerType)}
            >
              {EMPLOYER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label>
              Hours per week
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={80}
                value={profile.hoursPerWeek}
                onChange={num("hoursPerWeek")}
              />
            </label>
            <label>
              Qualifying payments so far
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={200}
                value={profile.qualifyingPayments}
                onChange={num("qualifyingPayments")}
              />
            </label>
          </div>
        </fieldset>
      )}

      <div className="actions">
        <button type="submit" className="primary">
          Next: your loans →
        </button>
      </div>
    </form>
  );
}
