<!-- OMC:START -->
<!-- OMC:VERSION:4.10.2 -->

# oh-my-Codex - Intelligent Multi-Agent Orchestration

You are running with oh-my-Codex (OMC), a multi-agent orchestration layer for Codex.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.Codex/**`, `.omc/**`, `.Codex/**`, `AGENTS.md`, `AGENTS.md`.
</model_routing>

<project>
name: TAIGA_ULTIMATE
type: Next.js 15 landing page (app router)
domain: Автоматизация бизнеса и AI-решения
languages: RU/EN (next-intl)
theme: light/dark (next-themes)
</project>

<tech_stack>
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + class-variance-authority + clsx + tailwind-merge
- next-themes (light/dark/system)
- next-intl (i18n: ru/en)
- zod + native React form state (forms)
- framer-motion (animations)
- lucide-react (icons)
</tech_stack>

<directory_structure>
TAIGA_ULTIMATE/
├── app/
│   └── [locale]/           # locale-based routing (ru/en)
│       ├── layout.tsx      # root layout with ThemeProvider + next-intl
│       └── page.tsx        # landing page
├── components/
│   ├── ui/                 # Button, Input, Accordion, Textarea
│   ├── layout/             # Header, Footer, ThemeSwitcher, LangSwitcher
│   ├── landing/            # HeroSection, ServicesBlock, FAQ, CTA, etc.
│   └── providers/          # ThemeProvider (next-themes wrapper)
├── lib/
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── messages/
│   ├── ru.json             # Russian translations
│   └── en.json             # English translations
└── .Codex/                # project rules and OMC config
</directory_structure>

<key_patterns>
- Locale routing: app/[locale]/layout.tsx receives locale from params
- next-intl: getMessages() in server components, useTranslations() in client
- ThemeProvider: wraps app with next-themes, handles CSS class attribute
- Animations: framer-motion for landing section reveals
- Icons: lucide-react exclusively
- UI components: compound pattern with class-variance-authority
</key_patterns>

<hot_paths>
- app/[locale]/layout.tsx (5x)
- package.json (3x)
- components/providers/ThemeProvider.tsx (3x)
</hot_paths>

<skills>
Invoke via `/oh-my-Codex:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-Codex:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State: `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-Codex:omc-setup`.

<!-- OMC:END -->
