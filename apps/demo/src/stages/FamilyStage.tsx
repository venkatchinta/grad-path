import { useState } from "react";
import type { AuthState, Invite } from "../state.js";

// DEMO MOCK (ADR-004): family linking simulated on-device. In the real
// implementation, invites are server-issued, students accept on their own
// device, and parents see consented progress summaries via the API.

export interface ProgressSummary {
  applyDone: number;
  applyTotal: number;
  affordSchools: number;
  repayScreened: boolean;
}

/** Sample linked student so the collective view is designable before the backend exists. */
const SAMPLE_STUDENT = {
  name: "Jordan (sample)",
  progress: { applyDone: 9, applyTotal: 15, affordSchools: 3, repayScreened: false },
};

const newCode = () =>
  `GP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

function ProgressCells(props: { p: ProgressSummary }) {
  const { p } = props;
  return (
    <>
      <td className="num">
        {p.applyDone}/{p.applyTotal}
      </td>
      <td className="num">{p.affordSchools}</td>
      <td className="num">{p.repayScreened ? "✓" : "—"}</td>
    </>
  );
}

export function FamilyStage(props: {
  auth: AuthState;
  selfProgress: ProgressSummary;
  onChange: (auth: AuthState) => void;
  onSignIn: () => void;
}) {
  const { auth } = props;
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");

  if (!auth.user) {
    return (
      <div className="card">
        <h1>Family tracking</h1>
        <p className="hint">
          Sign in to invite your student (or join your family) and follow
          progress together.
        </p>
        <div className="actions">
          <button type="button" className="primary" onClick={props.onSignIn}>
            Sign in to get started
          </button>
        </div>
      </div>
    );
  }

  const signOut = () =>
    props.onChange({ ...auth, user: undefined });

  // ---------- Parent view ----------
  if (auth.user.role === "parent") {
    const sendInvite = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      const invite: Invite = { code: newCode(), sentTo: email.trim(), status: "pending" };
      props.onChange({ ...auth, invites: [...auth.invites, invite] });
      setEmail("");
    };
    const markAccepted = (code: string) =>
      props.onChange({
        ...auth,
        invites: auth.invites.map((i) =>
          i.code === code ? { ...i, status: "accepted" } : i,
        ),
      });

    const acceptedInvites = auth.invites.filter((i) => i.status === "accepted");

    return (
      <div className="card">
        <h1>Your family</h1>
        <p className="hint">
          Signed in as {auth.user.name} (parent) via {auth.user.provider}.
          Students choose what to share: progress summaries only — never
          incomes, balances, or documents.
        </p>

        <section>
          <h2>Progress together</h2>
          <div className="table-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col" className="num">Apply steps</th>
                <th scope="col" className="num">Schools</th>
                <th scope="col" className="num">Repay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{auth.user.name} (you)</td>
                <ProgressCells p={props.selfProgress} />
              </tr>
              {acceptedInvites.map((i) => (
                <tr key={i.code}>
                  <td>{i.sentTo}</td>
                  <ProgressCells p={SAMPLE_STUDENT.progress} />
                </tr>
              ))}
              {acceptedInvites.length === 0 && (
                <tr>
                  <td>{SAMPLE_STUDENT.name}</td>
                  <ProgressCells p={SAMPLE_STUDENT.progress} />
                </tr>
              )}
            </tbody>
          </table>
          </div>
          <p className="hint">
            Apply steps done, award letters compared, and whether repayment
            screening is complete. Sample data shown until a student accepts
            your invite. Parents see counts and checkmarks, not amounts.
          </p>
        </section>

        <section>
          <h2>Invite your student</h2>
          <form onSubmit={sendInvite} className="field-row invite-row">
            <label>
              Student's email
              <input
                type="email"
                value={email}
                placeholder="student@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="primary">
              Send invite
            </button>
          </form>
          {auth.invites.length > 0 && (
            <ul className="invite-list">
              {auth.invites.map((i) => (
                <li key={i.code}>
                  <span>
                    <strong>{i.sentTo}</strong> · code <code>{i.code}</code> ·{" "}
                    {i.status === "accepted" ? "✅ joined" : "⏳ pending"}
                  </span>
                  {i.status === "pending" && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => markAccepted(i.code)}
                    >
                      Simulate accept (demo)
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mock-note" role="note">
            Demo preview — invites are generated on this device and no email is
            sent. The real flow emails the student a link with this code.
          </p>
        </section>

        <div className="actions">
          <button type="button" className="ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ---------- Student view ----------
  const joinFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    props.onChange({
      ...auth,
      joinedFamilyCode: codeInput.trim().toUpperCase(),
      shareWithFamily: true,
    });
    setCodeInput("");
  };

  return (
    <div className="card">
      <h1>Family sharing</h1>
      <p className="hint">
        Signed in as {auth.user.name} (student) via {auth.user.provider}. You
        control what your family sees — summaries only, and you can turn it off
        any time.
      </p>

      {!auth.joinedFamilyCode ? (
        <section>
          <h2>Join your family</h2>
          <form onSubmit={joinFamily} className="field-row invite-row">
            <label>
              Invite code from your parent
              <input
                type="text"
                value={codeInput}
                placeholder="GP-XXXXXX"
                autoCapitalize="characters"
                onChange={(e) => setCodeInput(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="primary">
              Join
            </button>
          </form>
        </section>
      ) : (
        <section>
          <h2>Linked</h2>
          <p>
            ✅ Joined family <code>{auth.joinedFamilyCode}</code>.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={auth.shareWithFamily}
              onChange={(e) =>
                props.onChange({ ...auth, shareWithFamily: e.target.checked })
              }
            />
            Share my progress summary with my family
          </label>
          <ul className="warnings">
            <li>Shared: checklist progress, schools compared, screening done.</li>
            <li>Never shared: income, loan balances, award amounts, documents.</li>
          </ul>
          <div className="actions">
            <button
              type="button"
              className="ghost"
              onClick={() =>
                props.onChange({ ...auth, joinedFamilyCode: undefined, shareWithFamily: false })
              }
            >
              Leave family
            </button>
          </div>
        </section>
      )}

      <div className="actions">
        <button type="button" className="ghost" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
