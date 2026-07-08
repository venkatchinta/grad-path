// Apply stage: a deadline-oriented application checklist. This is guidance
// content, not calculation — dates that vary by school are labeled as such,
// and fixed dates cite their official source.

interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  link?: { title: string; url: string };
}

interface ChecklistSection {
  season: string;
  items: ChecklistItem[];
}

const CHECKLIST: ChecklistSection[] = [
  {
    season: "Junior year (spring)",
    items: [
      {
        id: "college-list",
        label: "Build a balanced college list (reach / match / likely)",
        detail:
          "Include at least one affordable likely school you'd be happy to attend.",
      },
      {
        id: "net-price-calculators",
        label: "Run each school's net price calculator",
        detail:
          "Every college is federally required to publish one — sticker price is not what you'd pay.",
      },
      { id: "testing-plan", label: "Take the SAT/ACT (if your schools use scores) with time to retest" },
    ],
  },
  {
    season: "Summer before senior year",
    items: [
      {
        id: "common-app",
        label: "Start the Common App when it opens (August 1)",
        link: { title: "Common App", url: "https://www.commonapp.org/" },
      },
      { id: "essay-draft", label: "Draft and revise the personal essay" },
      { id: "recommenders", label: "Ask two teachers for recommendation letters" },
    ],
  },
  {
    season: "Senior fall",
    items: [
      {
        id: "fafsa",
        label: "File the FAFSA as soon as it opens (typically October 1)",
        detail:
          "Many states and colleges award first-come, first-served aid. Filing is free.",
        link: { title: "FAFSA — StudentAid.gov", url: "https://studentaid.gov/h/apply-for-aid/fafsa" },
      },
      {
        id: "css-profile",
        label: "Check whether any of your schools require the CSS Profile",
        link: { title: "CSS Profile", url: "https://cssprofile.collegeboard.org/" },
      },
      {
        id: "early-deadlines",
        label: "Submit Early Action / Early Decision applications (often Nov 1–15; check each school)",
        detail:
          "Early Decision is binding — never apply ED without confirming affordability first.",
      },
      { id: "scholarships-fall", label: "Apply to outside scholarships on a weekly rhythm" },
    ],
  },
  {
    season: "Senior winter",
    items: [
      {
        id: "regular-deadlines",
        label: "Submit Regular Decision applications (often Jan 1–15; check each school)",
      },
      { id: "verify-fafsa", label: "Complete any FAFSA verification requests promptly" },
    ],
  },
  {
    season: "Senior spring",
    items: [
      {
        id: "compare-offers",
        label: "Compare award letters on net price — use the Afford stage here",
        detail:
          "Don't compare headline 'total aid'; loans are not a discount.",
      },
      {
        id: "appeal",
        label: "Appeal your aid offer if circumstances changed or a rival offer is better",
      },
      {
        id: "decision-day",
        label: "Commit by the National Candidates Reply Date (May 1 at most schools)",
      },
    ],
  },
];

export function ApplyStage(props: {
  done: string[];
  onChange: (done: string[]) => void;
  onGoAfford: () => void;
}) {
  const toggle = (id: string) =>
    props.onChange(
      props.done.includes(id)
        ? props.done.filter((d) => d !== id)
        : [...props.done, id],
    );

  const total = CHECKLIST.reduce((n, s) => n + s.items.length, 0);
  const doneCount = props.done.length;

  return (
    <div className="card">
      <h1>Application checklist</h1>
      <p className="hint">
        {doneCount} of {total} done. Dates marked "check each school" vary —
        confirm on each college's admissions page.
      </p>
      <div
        className="meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={doneCount}
        aria-label="Checklist progress"
      >
        <div className="meter-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>

      {CHECKLIST.map((section) => (
        <section key={section.season}>
          <h2>{section.season}</h2>
          <ul className="checklist">
            {section.items.map((item) => (
              <li key={item.id}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={props.done.includes(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                  <span>
                    {item.label}
                    {item.detail && <span className="item-detail">{item.detail}</span>}
                    {item.link && (
                      <a href={item.link.url} target="_blank" rel="noreferrer">
                        {item.link.title}
                      </a>
                    )}
                    {item.id === "compare-offers" && (
                      <button type="button" className="inline-link" onClick={props.onGoAfford}>
                        Open the Afford stage →
                      </button>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
