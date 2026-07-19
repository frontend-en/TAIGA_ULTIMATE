---
name: bughunter
description: "Combined bug hunting skill: static analysis of git diff, runtime browser testing via Chrome DevTools MCP, and backend API validation. Trigger on: /bughunter, 'find bugs', 'hunt bugs', 'check for bugs', 'test changes'."
---

# Bug Hunter

## Intent
Comprehensive bug detection across the full stack. Combines three analysis modes into a single workflow, then produces a prioritized report.

## Modes

### Mode 1: Static Analysis (git diff)
Analyze all changed files (`git diff` for unstaged, `git diff --cached` for staged) and look for:

1. **Logic errors** — wrong conditions, off-by-one, null/undefined access, missing await, incorrect type coercions
2. **Race conditions** — TOCTOU in DB queries, unguarded shared state, missing mutex/locks
3. **Missing error handling** — unhandled promise rejections, empty catch blocks, silent failures
4. **Type safety** — `any` casts hiding real types, incorrect generic parameters, missing null checks
5. **API contract mismatches** — frontend expects field X but backend returns Y, changed response shapes
6. **Security** — unsanitized input, XSS vectors, SQL/NoSQL injection, missing auth checks
7. **State management** — stale closures in React hooks, missing dependencies in useEffect/useCallback/useMemo
8. **Resource leaks** — unclosed connections, missing cleanup in useEffect, dangling event listeners

### Mode 2: Runtime Browser Testing (Chrome DevTools MCP)
If Chrome DevTools MCP tools are available, perform interactive testing:

1. **Navigate** to the affected page (use localhost URLs from project config)
2. **Take screenshot** to verify visual state
3. **Check console** for errors, warnings, unhandled rejections
4. **Check network** for failed requests (4xx, 5xx), CORS errors, timeout issues
5. **Interact** with changed UI elements — click buttons, fill forms, verify responses
6. **Verify** that removed elements are actually gone, new elements appear correctly

### Mode 3: Backend API Validation
For backend changes, validate:

1. **Endpoint contracts** — request/response schemas match documentation
2. **Error responses** — proper status codes and error messages
3. **Auth guards** — protected endpoints reject unauthenticated requests
4. **Database operations** — correct query patterns, proper indexing hints
5. **Edge cases** — empty arrays, missing fields, concurrent access patterns

## Execution Order

1. Run **Static Analysis** first (fastest, catches most issues)
2. Run **Runtime Testing** if browser is available and UI changes detected
3. Run **API Validation** if backend routes changed
4. Compile unified report

## Report Format

```
# Bug Hunt Report

**Scope**: <branch name> | <N files changed> | <commit range>
**Date**: <YYYY-MM-DD>

## Critical Bugs (must fix before merge)

### BUG-001: <title>
- **File**: <path>:<line>
- **Type**: <Logic Error | Race Condition | Security | ...>
- **Impact**: <what breaks>
- **Evidence**: <code snippet or screenshot>
- **Fix**: <suggested fix>

---

## Warnings (should fix)

### WARN-001: <title>
- **File**: <path>:<line>
- **Type**: <type>
- **Risk**: <what could go wrong>
- **Fix**: <suggested fix>

---

## Runtime Findings

### RT-001: <title>
- **Page**: <URL>
- **Type**: <Console Error | Network Failure | Visual Bug | ...>
- **Evidence**: <screenshot or log excerpt>
- **Steps to reproduce**: <steps>

---

## Summary
- Critical: <N>
- Warnings: <N>
- Runtime: <N>
- **Verdict**: <SAFE TO MERGE | NEEDS FIXES | BLOCKED>
```

If no issues found in a category, show: `None found.`

## Important Rules

1. **Never guess** — only report issues you can prove with evidence (code, screenshot, log)
2. **Check both sides** — if frontend changes, verify backend contract still matches
3. **Test the happy path AND edge cases** — empty data, network errors, concurrent users
4. **Prioritize by impact** — data loss > security > UX bugs > cosmetic issues
5. **Include the fix** — every bug report must have a concrete suggested fix
6. **Don't report style issues** — this is not a linter, focus on actual bugs
7. After the report, ask: "Would you like me to fix the critical bugs?"
