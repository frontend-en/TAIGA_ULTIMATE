# Frontmatter Schema Reference

## Universal Fields (All Note Types)

Every note MUST include these fields:

```yaml
---
title: "Human-readable title"
type: doc                    # See type enum below
status: draft                # See status enum below
created: 2026-03-13
updated: 2026-03-13
---
```

Recommended optional fields:

```yaml
project: "project-slug"     # Link to parent project
scope: "backend"             # Domain or area
tags: [architecture, api]    # Categorization tags
related: ["[[other-note]]"]  # Explicit cross-references
```

## Type Enum

| Value | Use For |
| ----- | ------- |
| `doc` | General documentation, design notes, guides |
| `adr` | Architecture Decision Records |
| `howto` | Step-by-step operational guides |
| `spec` | Technical specifications |
| `moc` | Map of Content (index notes) |
| `meeting` | Meeting notes and protocols |
| `runbook` | Incident response and operational playbooks |
| `requirement` | Requirements and acceptance criteria |
| `daily` | Daily review/standup notes |
| `weekly` | Weekly review/retrospective notes |

## Status Enum

| Value | Meaning |
| ----- | ------- |
| `draft` | Work in progress, incomplete |
| `active` | Current, maintained, authoritative |
| `deprecated` | Outdated, kept for reference only |
| `accepted` | Decision approved (ADR-specific) |
| `proposed` | Decision under review (ADR-specific) |
| `rejected` | Decision rejected (ADR-specific) |
| `superseded` | Replaced by a newer document (ADR-specific) |
| `done` | Completed, no further action needed (review-specific) |

## Type-Specific Fields

### ADR (`type: adr`)

```yaml
---
title: "ADR-001: Use Event Sourcing"
type: adr
status: proposed
created: 2026-03-13
updated: 2026-03-13
project: "project-foo"
adr-id: "ADR-001"
decided_at: ""
deciders:
  - "Person A"
  - "Person B"
component: "billing-service"
supersedes: ""
superseded_by: ""
tags: [adr, architecture]
---
```

### Meeting (`type: meeting`)

```yaml
---
title: "Sprint Planning 2026-W11"
type: meeting
status: active
created: 2026-03-13
updated: 2026-03-13
project: "project-foo"
date: 2026-03-13
time: "10:00"
attendees:
  - "Person A"
  - "Person B"
kind: planning
facilitator: "Person A"
tags: [meeting, sprint]
---
```

`kind` values: `standup`, `planning`, `refinement`, `retro`, `review`, `workshop`, `ad-hoc`.

### Requirement (`type: requirement`)

```yaml
---
title: "User Authentication via SSO"
type: requirement
status: draft
created: 2026-03-13
updated: 2026-03-13
project: "project-foo"
priority: high
source: "Client request"
acceptance_criteria:
  - "SSO login works with corporate IdP"
  - "Session persists for 8 hours"
tags: [requirement, security]
---
```

`priority` values: `critical`, `high`, `medium`, `low`.

### Runbook (`type: runbook`)

```yaml
---
title: "Database Failover Procedure"
type: runbook
status: active
created: 2026-03-13
updated: 2026-03-13
project: "project-foo"
service: "billing-db"
severity: critical
env: production
last_tested: 2026-02-15
owner: "SRE Team"
tags: [runbook, database, incident]
---
```

`severity` values: `critical`, `high`, `medium`, `low`.
`env` values: `production`, `staging`, `dev`.

### Daily Review (`type: daily`)

```yaml
---
title: "Daily Review 2026-03-13"
type: daily
status: active
created: 2026-03-13
updated: 2026-03-13
date: 2026-03-13
period: daily
tags: [daily, review]
---
```

### Weekly Review (`type: weekly`)

```yaml
---
title: "Weekly Review 2026-W11"
type: weekly
status: active
created: 2026-03-13
updated: 2026-03-13
date: 2026-03-13
period: weekly
tags: [weekly, review]
---
```

### MOC (`type: moc`)

```yaml
---
title: "Backend Architecture"
type: moc
status: active
created: 2026-03-13
updated: 2026-03-13
scope: "backend"
tags: [moc, index]
---
```

## Validation Rules

1. `title` — non-empty string, matches the H1 heading in the note body.
2. `type` — must be one of the enum values above.
3. `status` — must be one of the enum values above; use general statuses for most types, ADR-specific statuses only for `type: adr`.
4. `created` / `updated` — ISO 8601 date format (`YYYY-MM-DD`).
5. List fields (`tags`, `attendees`, `deciders`, `acceptance_criteria`) — use YAML array syntax.
6. Link fields (`related`, `supersedes`, `superseded_by`) — use `[[wiki-link]]` format inside quotes.

## Best Practices

- Keep property names lowercase with hyphens: `adr-id`, not `AdrId` or `adr_id`.
- Store metadata in frontmatter, not as inline `key:: value` fields. Frontmatter is machine-parseable and works with both Obsidian Properties and CLI tools.
- Avoid duplicating the same field in both frontmatter and note body.
- Update the `updated` field on every significant edit.
