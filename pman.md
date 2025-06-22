# StrideSync Lint-Debt Remediation Plan

> **Document purpose** – Provide a _practical, step-by-step playbook_ for driving the current ESLint report from **486 issues → 0** in the shortest, safest time.  This is not a one-off fix; it is a process we can rerun continually.

---

## 1. High-level goals

1. **Keep `main` always green** – tackle lint debt in small, reviewable PRs.
2. **Automate where possible** – rely on ESLint `--fix`, Prettier, codemods & search-replace.
3. **Address root-causes, not symptoms** – e.g., decide on PropTypes vs TypeScript instead of sprinkling `/* eslint-disable */`.
4. **Introduce safety nets** – CI gate + pre-commit hook to stop issues from re-appearing.

---

## 2. Issue inventory

| Category | Rule (abridged) | Count | Notes |
|----------|-----------------|-------|-------|
| **Blocking Errors** | `parser`  / `jsx-no-undef` | 2 | Must be fixed first – build fails |
| **Formatting** | `prettier/prettier` | ~40 | Auto-fixable |
| **Prop validation** | `react/prop-types` | 100+ | Needs strategic decision |
| **Style objects** | `react-native/no-*` | 150+ | Inline color / unused styles |
| **Hooks** | `react-hooks/*` | 20 | Missing deps / conditional hooks |
| **Code quality** | `no-unused-vars`, `no-shadow`, `no-dupe-keys` | 60+ | Mostly auto-fixable or trivial edits |

*(Counts are approximate; see latest ESLint run for exact numbers.)*

---

## 3. Workflow outline

1. **Create a dedicated branch** – `lint-cleanup/<stage>` per stage.
2. **Run ESLint with JSON output** & commit the report for visibility.
3. **Apply the fixes described below**, commit after each logical chunk.
4. **Push & open PR** – include checklist (see §7) and request review.
5. **Merge & rebase next branch** – keeps diff sizes manageable.

---

## 4. Stage-by-stage playbook

### Stage 0 – Tooling & CI guards  *(0.5 d)*

- [ ] Add Husky pre-commit: `npm pkg set scripts.prepare="husky install" && npx husky add .husky/pre-commit "npm run lint"`.
- [ ] Add GitHub Action / EAS pipeline step: `npm ci && npm run lint`.
- [ ] Verify failure when errors exist.

### Stage 1 – Clear **blocking errors**  *(0.25 d)*

1. `src/components/ShoeListItem.js` – fix unmatched brace at line 331.
2. `src/screens/RetiredShoesReportScreen.js` – import `ScrollView`.

Commit: `fix(build): resolve parsing & undefined identifier errors`.

### Stage 2 – Run **automatic fixes**  *(0.25 d)*

```
# prettier & eslint autofix
yarn lint --fix   # or npm run lint -- --fix
```

Commit: `chore(lint): auto-fixed formatting & trivial rules`.

### Stage 3 – **Unused / duplicate code**  *(0.5 d)*

- Delete unused vars / imports flagged by `no-unused-vars`.
- Remove duplicate keys / imports.

Commit per folder: `refactor(<folder>): remove dead code & duplicates`.

### Stage 4 – **Prop validation strategy**  *(1 d)*

> Decision point: _stay with PropTypes_ _vs_ _migrate to TypeScript_.

Option A – Keep PropTypes
- Add `yarn add prop-types` if not present.
- Use VS Code snippet to scaffold PropTypes for each component.
- For simple/presentational components, add JSDoc `@typedef` + `/** @typedef {…} */` to generate PropTypes via `babel-plugin-transform-react-doc-gen` (optional).

Option B – Move to TypeScript (recommended mid-term)
- Rename one component `*.tsx` as spike.
- Install TS + `@types/react`, update metro/babel config.
- Configure ESLint with `@typescript-eslint` & extend rule overrides.

*For now we'll do Option A to close the warnings quickly; open a follow-up ticket to evaluate TS migration.*

### Stage 5 – **React-Native style rules**  *(1 d)*

1. Move literal colors into `src/theme/theme.js` palette.
2. Replace inline styles with `StyleSheet.create` objects.
3. Delete unused StyleSheet entries.

> Tip: Use regex search: `style={{[^}]*}}` to locate inline styles.

Commit in small PRs per screen/component.

### Stage 6 – **Hooks correctness**  *(0.5 d)*

- Add missing dependencies in `useEffect` / `useCallback`.
- Refactor conditional hook calls – pull hooks above conditions or split into new components.

### Stage 7 – **Rule tune-up & documentation**  *(0.25 d)*

- Review any remaining warnings; decide to:
  * Fix in code, **or**
  * Adjust `.eslintrc.js` severity / disable if intentional.
- Document the reasoning in `docs/developer-guides/state-management.md` or new `docs/developer-guides/linting.md`.

---

## 5. Estimated timeline (2.5 dev-days)

| Day | Milestone |
|-----|-----------|
| 0   | Tooling guard + blocking errors fixed |
| 0.5 | Auto-fix pass + dead-code cleanup |
| 1.5 | PropTypes added or TS spike completed |
| 2.5 | Style/Hooks cleanup & zero-warning gate merged |

*(Assumes single developer focus; adjust if multi-dev.)*

---

## 6. Ownership matrix

| Task | Primary | Reviewer |
|------|---------|----------|
| Tooling/CI | @dev-ops | @lead |
| Stage 1–3 code fixes | @frontend | @lead |
| PropTypes sweep | @frontend | @qa |
| Style refactor | @frontend | @ux |
| Hooks refactor | @frontend | @lead |

---

## 7. PR checklist template

```md
- [ ] `npm run lint` returns **0 errors 0 warnings**
- [ ] Unit tests pass (`npm test`)
- [ ] No UI regressions (manual smoke test)
- [ ] Added/updated documentation if needed
```

---

## 8. Future improvements

1. Investigate full TypeScript migration (see Jira TS-101).
2. Enable `eslint-plugin-jest` rules for test files.
3. Enforce commit linting via Commitizen + commitlint.
4. Hook linting into Expo EAS or Fastlane build steps.

> _"An ounce of automation is worth a pound of intervention."_ – future-us, once this is green 

<!-- Progress Log -->
### 🔄 Progress Update (date auto)

- PropTypes sweep underway (Option A).  Components covered so far:
  - UI atoms: `Button`, `Card`, `Input`, `LoadingIndicator`, `LoadingSkeleton`
  - Shared components: `EmptyState`, `ErrorState`, `FilterModal`, `QuickAction`, `StatsCard`
  - Run-tracking atoms: `AudioCuesToggle`, `ControlButtons`, `GPSStatusIndicator`, `GoalInput`, `RunMapView`, `RunTypeSelector`, `ShoeSelector`, `StatsDisplay`
  - save_run sub-views: `EffortMoodSelector`, `RunDetailsForm`, `WeatherSelector`
  - Screens: `PauseScreen`, `ActiveRunScreen`, `RunSummaryScreen`, `SaveRunScreen`, `RunDetailScreen`
  - Context providers: `ThemeProvider`, `StoreProvider`
- ESLint status: **0 errors / 286 warnings**  
  • `react/prop-types` warnings remaining: **55** (down from ~170 starting point).  
  • All other warnings (colors, inline-styles, unused vars) unchanged for now.
- Next action: Continue PropTypes on `HomeScreen`, `ShoeDetailScreen`, `ShoeListScreen`, `RetiredShoesReportScreen`, `RunDetailScreen` sub-stats, tests. 