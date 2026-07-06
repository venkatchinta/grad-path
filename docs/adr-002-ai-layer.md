# ADR-002: AI Layer Design

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

GradPath's design principles require that AI is used only for conversation and
guidance — never in the deterministic math/calculation layer. This ADR defines how
the AI model is actually used in the mobile-first PWA (ADR-001), and the guardrails
appropriate to giving loan guidance to financially stressed people.

## Decision 1: AI is the interface; the engine is the authority (tool-use pattern)

The LLM never computes anything. It calls `@gradpath/engine` functions as tools and
narrates the results:

1. Student writes in natural language ("I'm a teacher making $52k with $60k in
   loans — what should I do?") or taps a suggested prompt.
2. The model does **intake and translation**: extracts structured inputs (income,
   family size, employer type, loan types) and asks follow-up questions when
   something is missing.
3. With structured inputs, the model invokes engine tools — e.g.
   `calculateRAP(...)`, `screenPSLF(...)`, `comparePlans(...)` — which return
   deterministic, citation-backed results.
4. The model **explains** the results in plain language, at the student's level, in
   their preferred language, and answers follow-ups ("why is my payment higher under
   IBR?").
5. Every factual claim carries the engine's citation, not the model's memory.
   Questions outside the engine's rules route to escalation (Decision 4).

This makes "no AI in the math layer" real rather than aspirational: mid-conversation,
the numbers on screen still come from auditable TypeScript, and a wrong number is a
unit-test failure, not a hallucination.

## Decision 2: Client-side tool execution; server sees only derived facts

```
Phone (PWA)                      Edge function                 LLM API
┌─────────────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│ React UI + chat          │────▶│ Holds API key         │────▶│ Claude       │
│ @gradpath/engine (local) │◀────│ Strips/blocks PII     │◀────│ (tool calls) │
│ Parsed My Aid Data       │     │ Rate limiting         │     └─────────────┘
│ (never uploaded)         │     │ System prompt + tools │
└─────────────────────────┘     └──────────────────────┘
```

The edge function proxies the conversation and holds the API key. When the model
requests a tool call, the request returns to the client, the engine runs locally
against the student's data, and only the **result** (a payment amount, an eligibility
flag) re-enters the conversation. Raw "My Aid Data" files and full loan histories
never transit our server or the LLM API. The model sees only minimal derived facts
("borrower has $42k federal Direct loans, nonprofit employer, 34 qualifying
payments"), and the consent notice shown before the first message says exactly that.

## Decision 3: Mobile-first interaction design

- **Streaming responses** (SSE) so answers render token-by-token on flaky mobile
  connections.
- **Structured UI over chat walls.** The model returns structured suggestions the UI
  renders as tappable cards (plan-comparison table, next-step checklist, quick-reply
  chips) via dedicated render tools, rather than long prose on a small screen.
- **Chat is progressive enhancement, not load-bearing.** The three-step screening
  flow works as plain forms + engine with no AI at all — so the app is fully
  functional offline, free to operate for form-only users, and LLM tokens are spent
  only where they add value.
- **Cost tiering.** Haiku-class models for cheap tasks (intake extraction,
  quick-reply suggestions); the stronger model reserved for the advisory
  conversation. Prompt caching on the long system prompt (policy context, tool
  definitions, citation rules) cuts per-message cost.

## Decision 4: Domain guardrails

- **Hard boundary in the system prompt:** the model must never state a payment
  amount, eligibility conclusion, or deadline that didn't come from an engine result
  or a cited official source, and must decline to speculate ("I can't verify that;
  here's the official StudentAid.gov page").
- **Escalation is a first-class outcome:** low confidence and known edge cases
  (joint consolidation loans, defaulted loans, borrower defense claims) route to
  "talk to a human expert / your official servicer," not best-effort answers. This
  is the `recommend` module's expert-escalation logic surfaced in conversation.
- **PII blocking is mechanical, not aspirational:** the edge function enforces
  regex/classifier blocks on SSN-shaped strings and account numbers before anything
  reaches the model; prompt instructions are a second layer, not the control.
- **Logging for quality, not surveillance:** conversation retention for system
  improvement is opt-in, anonymized, and plainly disclosed.

## Consequences

- The trust-bearing logic stays in the open-source engine anyone can audit; the AI
  layer is one edge function plus a system prompt, thin and swappable.
- The engine's public API must be designed as a tool surface (JSON-schema-friendly
  inputs/outputs with citations attached to results).
- Per-conversation cost is the platform's main variable cost; Decision 3's tiering
  and caching are the levers.
