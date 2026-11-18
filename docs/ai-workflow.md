# How this project was built with AI agents

This project was built with **Claude Code** (Anthropic's coding agent) in one session. I made the decisions and reviewed the output; the agents did the planning, coding and verification. This page covers who did what, how the agents were coordinated, and what I'd recommend for this way of working.

## 1. The agents and their jobs

| Agent                                         | Job                                                                                                                                                                      | Output                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Main agent** (Claude Code, plan mode first) | Read the brief and the reference screenshot, wrote the plan, asked me the decisions only I could make, built the Payments screen, and verified and integrated everything | Plan, core app, tests, README                                      |
| **Agent A** (parallel)                        | Money-movement pages: Balances, Payouts, Top-ups, Collected fees, Transfers, All activity                                                                                | `components/sections/{balances,payouts,…}`, `lib/mock/treasury.ts` |
| **Agent B** (parallel)                        | Analytics and risk pages: Home, Payments analytics, Reports, Sigma, Radar, Disputes, Revenue recognition                                                                 | `components/sections/{home,radar,…}`, `lib/mock/analytics.ts`      |
| **Agent C** (parallel)                        | Product and platform pages: Product catalog, Subscriptions, Invoices, Payment links, Connect, Connected accounts, Tax, Issuing, Climate, Developers                      | `components/sections/{product-catalog,…}`, `lib/mock/catalog.ts`   |

The three parallel agents were forks of the main agent. A fork starts with the main agent's full context: the brief, the code already written, the design tokens and the conventions. That's why their pages match the Payments screen without a long explanation.

### Skills

The project folder had four installed skills. Only two were relevant:

| Skill                       | Used? | Where                                                                                                                                                                                                      |
| --------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript-advanced-types` | Yes   | `ColumnMeta` module augmentation for the table, discriminated unions (`PaymentMethod`, `DateFilter`, `AmountFilter`), the `satisfies Record<SectionSlug, …>` registry, and generic `CheckboxListFilter<T>` |
| `web-design-guidelines`     | Yes   | A final audit against Vercel's interface guidelines. It added a skip link, scroll padding for the sticky top bar and a `theme-color` meta tag; the rest already passed                                     |
| `analyze-project`           | No    | It's for deep-learning repositories                                                                                                                                                                        |
| `nodejs-backend-patterns`   | No    | The app has no backend; the data is an in-memory service                                                                                                                                                   |

## 2. How the work was coordinated

```
 Brief + screenshot
        │
        ▼
 ┌─────────────┐   questions about stack, scope, deploy, git account
 │ PLAN (main) │ ◄──────────────────────────────────────────── human
 └─────┬───────┘
       ▼
 ┌──────────────────────┐
 │ BUILD CORE (main)    │  data layer → shell → table → filters → details
 └─────┬────────────────┘
       ▼
 ┌──────────────────────┐   screenshot vs reference, measure, fix,
 │ VERIFY LOOP (main)   │   repeat; headless Chrome clicks every feature
 └─────┬────────────────┘
       ▼
 ┌──────── FAN-OUT (3 agents in parallel) ────────┐
 │  Agent A           Agent B           Agent C   │  each owns its own folders
 └──────────────────────┬─────────────────────────┘
                        ▼
 ┌──────────────────────┐
 │ INTEGRATE (main)     │  typed registry, remove dead code, test all pages,
 └─────┬────────────────┘  production build, commit
       ▼
    Human review
```

### Phase by phase

1. **Plan before writing code.** The session started in plan mode, where the agent can only read. It read the PDF, pulled out the reference image and listed every label it would need to match. Then it asked me four questions: stack (Tailwind + Radix), which optional features to build, whether a Stripe account was available, and where to deploy. Nothing was built until I approved the plan.
2. **Build the core alone.** The required Payments screen was built by one agent, in order: types → mock data → filters and URL state → shell → table → filters → details page. One agent keeps the conventions (tokens, table style, how the clock is handled during server rendering) in one head.
3. **Verify like a reviewer would.** The agent cut zoomed crops of the reference screenshot and multiplied by about 1.4 to get pixel sizes at 1440px. It took headless Chrome screenshots of the app and compared positions until the column offsets were within about 3px. A puppeteer script then clicked through every feature: sorting, paging, each filter, reloading a filtered URL, CSV export, copy ID and row navigation. This found real bugs: a hydration mismatch, mixed-currency amount sorting, and a production build that broke the running dev server.
4. **Fan out only independent work.** The other 23 Dashboard sections don't depend on each other, so they were split across three agents. Each agent got a written contract (next section).
5. **Integrate and check again.** The main agent wired the pages into a registry that the type checker verifies (a missing page is a compile error). It removed code the new pages had replaced, loaded all 25 pages checking for console errors and horizontal overflow, and ran the production build in a scratch copy so the dev server wasn't disturbed. Then it committed.

### The contract each parallel agent got

- **File ownership:** only create files in your own `components/sections/<slug>/` folders and your own `lib/mock/<domain>.ts`. Don't edit shared files; if a shared change seems necessary, say so in the report.
- **Forbidden actions:** no `next build`, no starting or stopping the dev server, no touching `.next`, no git commits.
- **Interface:** one named export per page (`PayoutsView`, …), a client component with no props.
- **Conventions:** same table classes as the Payments table, `useHydrated` for anything that depends on time or time zone, seeded data, no new dependencies.
- **Report back:** for each page, the file and export name, plus anything the integrator must know.

That's why three agents could write about 30 files (23 pages, their helpers and data modules) at the same time without a single merge conflict.

## 3. Recommendations for working with AI agents

**Keep the decisions with you**

- Approve a plan before any code. Plan mode costs minutes and saves hours.
- Make the decisions only you can make: stack, scope, deadlines, which accounts and credentials to use. In this project the agent asked which GitHub account to commit with, and committed as `weltk234` instead of the work account.
- Review the result like a reviewer would, including the screenshots, not just the code.

**Give the agent a reference and a way to check**

- A screenshot, a spec or an existing page beats a description. The agent measured the reference instead of guessing.
- Ask for verification in the real environment: browser screenshots, scripted clicks, the console, a production build. "It compiles" isn't "it works".

**Parallelize carefully**

- Only fan out work that is truly independent, and only after the shared foundation exists: types, design tokens, UI primitives, conventions.
- Give each agent exclusive file ownership and a list of forbidden actions. Shared files and builds running at the same time are where parallel agents collide.
- Define the interface up front (an export name and its props), then integrate centrally with something the compiler checks, like `satisfies Record<…>`.
- Forks, which inherit the main agent's context, work well for "more of the same, in the house style". Use fresh agents for unrelated research.

**Use skills deliberately**

- Install skills that match the work, and say which ones not to use and why. Not every installed skill fits every project.

**Keep a tight feedback loop**

- Small commits with clear messages, and an agent that reports what it didn't test as well as what it did.
- When something breaks, ask "why?" before "fix it". In this project, dead buttons turned out to be a stale build cache, not a code bug.
