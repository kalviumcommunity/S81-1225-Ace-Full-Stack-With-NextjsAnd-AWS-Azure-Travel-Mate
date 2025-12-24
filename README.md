# Travel Mate – Engineering Workflow

## Collaboration Workflow

### Branch Naming Conventions
| Branch Type | Pattern | Typical Use |
| --- | --- | --- |
| Feature | `feature/<short-feature-name>` | New endpoints, UI flows, or experiments |
| Fix | `fix/<bug-or-issue>` | Regression fixes or hot-fixes |
| Chore | `chore/<maintenance-task>` | Dependency bumps, config tweaks |
| Docs | `docs/<doc-update>` | README edits, ADRs, diagrams |

Guidelines:
- Keep names lowercase-with-dashes and mirror the related issue key when possible (e.g., `feature/tm-42-search-filters`).
- One problem per branch; never mix unrelated workstreams.
- Delete remote branches once merged to keep `origin` tidy.

### Pull Request Template
- Centralized in `.github/pull_request_template.md` so every PR auto-populates the same structure.
- Sections: summary, detailed change list, evidence (screenshots/logs), and a gated checklist covering build/tests, reviews, and issue linkage.
- Authors must keep the checklist up to date and strike out any non-applicable bullet, ensuring reviewers can trust the state of the change.

### Code Review Checklist
Every reviewer should confirm the following before approving:
1. Branch follows the naming convention above.
2. Feature works locally; happy-path and edge-paths are exercised.
3. Browser console and server logs are clear of new warnings/errors.
4. `npm run lint` / `npm run test` (or the relevant task) passes locally.
5. Naming, comments, and docs are intentional—no dead code or todo clutter remains.
6. Secrets, tokens, or .env values are never committed; configs use placeholders.
7. Accessibility basics (aria labels, contrast, keyboard paths) hold up where applicable.

### Branch Protection Rules
Configure these in GitHub → Settings → Branches → **Branch protection rules**:
1. Target branch: `main` (or `production`).
2. Require pull request reviews: minimum 1 approval; dismiss stale reviews on new commits.
3. Require status checks to pass: add CI workflows such as lint, tests, and type-check; enforce “Require branches to be up to date”.
4. Restrict direct pushes: only allow admins if necessary; everyone else must open PRs.
5. Optionally require signed commits and conversation resolution before merging for extra safety.

### Why This Workflow Matters
This workflow enforces early review, predictable branch names, and automated quality gates, which means:
- **Quality**: Regressions surface during lint/test runs or review rather than after deploy.
- **Collaboration**: Uniform templates and checklists reduce reviewer guesswork and onboarding time.
- **Velocity**: Small, topic-scoped branches keep merge conflicts low and unblock teammates faster.

### Evidence / Screenshots
- Capture at least one merged PR showing passing checks and resolved review conversations.
- Store proof under `docs/screenshots/` (e.g., `docs/screenshots/pr-checks.png`) and embed it here using standard Markdown image syntax.
- Replace this bullet with the final screenshot reference once captured.

---

## Rendering Strategies – Travel Mate

### Static Rendering (SSG)
- Page: /about
- Reason: App description rarely changes
- Benefit: Fastest load, zero server cost

### Dynamic Rendering (SSR)
- Page: /dashboard
- Reason: User-specific data
- Benefit: Real-time accuracy

### Hybrid Rendering (ISR)
- Page: /places
- Reason: Popular places update occasionally
- Benefit: Fast like static, fresh like dynamic


