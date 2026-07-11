import { useState } from "react";
import type { AuthState, MockUser, Provider, Role } from "../state.js";

// DEMO MOCK: simulates the OAuth handoff to design the workflow (ADR-004).
// The real implementation is Supabase Auth with Google/Apple providers.

export function AuthScreen(props: {
  auth: AuthState;
  onChange: (auth: AuthState) => void;
  onDone: (role: Role) => void;
}) {
  const [provider, setProvider] = useState<Provider | undefined>();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | undefined>();

  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !role || !name.trim()) return;
    const user: MockUser = {
      name: name.trim(),
      email:
        provider === "google"
          ? `${name.trim().toLowerCase().replace(/\s+/g, ".")}@gmail.com`
          : "hidden@privaterelay.appleid.com",
      provider,
      role,
    };
    props.onChange({ ...props.auth, user });
    props.onDone(role);
  };

  if (!provider) {
    return (
      <div className="card auth-card">
        <h1>Save your progress</h1>
        <p className="hint">
          An account syncs your progress across devices and lets families track
          the journey together. Screening always works without one — and your
          financial details stay on your device either way; accounts sync
          progress summaries only.
        </p>
        <div className="auth-buttons">
          <button type="button" className="oauth google" onClick={() => setProvider("google")}>
            <GoogleMark /> Continue with Google
          </button>
          <button type="button" className="oauth apple" onClick={() => setProvider("apple")}>
            <AppleMark /> Continue with Apple
          </button>
        </div>
        <p className="mock-note" role="note">
          Demo preview — sign-in is simulated on this device; no account is
          created and nothing is sent anywhere.
        </p>
      </div>
    );
  }

  return (
    <form className="card auth-card" onSubmit={finish}>
      <h1>{provider === "google" ? "Google" : "Apple"} sign-in (simulated)</h1>
      <label>
        Your name
        <input
          type="text"
          value={name}
          placeholder="e.g. Sam Rivera"
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </label>

      <h2>I am a…</h2>
      <div className="role-options">
        <label className={`role-option${role === "student" ? " selected" : ""}`}>
          <input
            type="radio"
            name="role"
            checked={role === "student"}
            onChange={() => setRole("student")}
          />
          <span>
            <strong>🎒 Student</strong>
            <span className="stage-blurb">
              Applying, paying, or repaying — this journey is mine.
            </span>
          </span>
        </label>
        <label className={`role-option${role === "parent" ? " selected" : ""}`}>
          <input
            type="radio"
            name="role"
            checked={role === "parent"}
            onChange={() => setRole("parent")}
          />
          <span>
            <strong>👨‍👧 Parent / guardian</strong>
            <span className="stage-blurb">
              I'm supporting a student and want to invite them and follow
              progress together.
            </span>
          </span>
        </label>
      </div>

      <div className="actions">
        <button type="button" onClick={() => setProvider(undefined)}>
          ← Back
        </button>
        <button type="submit" className="primary" disabled={!role || !name.trim()}>
          Continue
        </button>
      </div>
    </form>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.2 3.5 2.7.24.03c2.2-2.1 3.5-5.1 3.5-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.8-2.1-6.8-5l-.2.02-3.6 2.8-.05.2C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.3-.8-.4-1.6-.4-2.4s.2-1.7.4-2.4l-.01-.2-3.7-2.8-.12.06C.5 8.2 0 10 0 12s.5 3.8 1.4 5.4l3.8-3z" />
      <path fill="#EB4335" d="M12 4.6c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.6l3.8 3c1-2.9 3.6-5 6.8-5z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8s2.1-1.2 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-1-2.4-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
    </svg>
  );
}
