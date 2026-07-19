# Vault Structure Reference

## Canonical Directory Layout

```text
vault/
  00-meta/                    # Global indexes, glossary, contribution guide
    00-index.md               # Home MOC — entry point for the entire vault
    glossary.md               # Domain terms and abbreviations
    patterns.md               # Reusable patterns and conventions
  10-projects/                # Active projects (each has backlog, repo, releases)
    project-name/
      00-index.md             # Project MOC — links to all project artifacts
      adr/                    # Architecture Decision Records
      specs/                  # Specifications and requirements
      notes/                  # Design notes, meeting notes, spike results
      runbooks/               # Operational playbooks
      api/                    # API docs, endpoint notes, payloads
  20-areas/                   # Ongoing responsibilities (Infrastructure, Security, etc.)
    area-name/
      00-index.md
  30-resources/               # Reusable knowledge (language notes, patterns, tools)
    topic-name.md
  40-archive/                 # Closed projects, stale areas (moved monthly/quarterly)
  templates/                  # Note templates (ADR, meeting, runbook, etc.)
```

## Naming Rules

| Rule | Example |
| ---- | ------- |
| Lowercase kebab-case, no spaces | `api-design-overview.md` |
| Numeric prefixes for sort order | `00-index.md`, `10-architecture/`, `20-decisions/` |
| Date prefix for chronological notes | `2026-03-13-standup.md` |
| MOC files named `00-index.md` | `10-projects/foo/00-index.md` |
| Max 3 levels of directory nesting | `10-projects/foo/adr/adr-001.md` |

## Numeric Prefix Conventions

Use numeric prefixes at two levels:

**Top-level folders** — fixed layout, rarely changes:
- `00-` meta and indexes
- `10-` projects (active work)
- `20-` areas (ongoing responsibilities)
- `30-` resources (reference knowledge)
- `40-` archive (completed/stale)

**Within a project** — content categories:
- `00-index.md` — project MOC (always first)
- `adr/`, `specs/`, `notes/`, `runbooks/`, `api/` — flat subdirectories

## MOC (Map of Content) Placement

- One `00-index.md` per project and per area — acts as the local README.
- One global `00-meta/00-index.md` — links to all major MOCs.
- Keep MOCs short and curated. Place auto-generated indexes under `## Index` at the bottom.

## Multi-Project Vault

For consulting or multi-client vaults, replace `10-projects/` with `clients/`:

```text
vault/
  00-meta/
  clients/
    acme/
      00-index.md
      adr/
      notes/
    globex/
      00-index.md
  30-resources/
  40-archive/
  templates/
```

## Embedded Vault (Inside a Code Repository)

When the vault lives alongside source code:

```text
repo/
  .obsidian/              # Vault config (gitignored or committed)
  docs/                   # Obsidian vault root
    00-index.md
    adr/
    api/
    howto/
    ops/
  src/
  scripts/
```

Point AI assistants to `docs/` as the knowledge root.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
| ------------ | ------- | --- |
| Deep nesting (4+ levels) | Hard to navigate via CLI; long paths in grep output | Flatten to max 3 levels; use links instead of folders |
| Spaces in filenames | Requires quoting in every shell command | Use kebab-case exclusively |
| No MOC/index files | No entry points; AI must scan entire tree | Add `00-index.md` to every project and area |
| Mixing content types in one folder | grep returns noisy results | Separate `adr/`, `specs/`, `notes/`, `runbooks/` |
| Opaque Zettelkasten IDs as filenames | `202603131415.md` tells nothing | Use descriptive slugs: `event-sourcing-decision.md` |
| No numeric prefixes | Inconsistent sort order across tools | Prefix folders with `00-`, `10-`, etc. |
| Flat vault with 500+ files at root | Impossible to scope searches | Use the canonical folder hierarchy |
