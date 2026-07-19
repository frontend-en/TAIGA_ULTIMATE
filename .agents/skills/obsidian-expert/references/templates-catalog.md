# Templates Catalog

## Overview

Templates are note skeletons with pre-filled frontmatter and standardized section headings. Each template defines the structure for a specific note type. When creating a new note, select the appropriate template, fill in the frontmatter values, and replace placeholder text with actual content.

All templates are located in the `templates/` directory of this skill.

## Template Index

| Template | Type | When to Use |
| -------- | ---- | ----------- |
| `adr.md` | adr | Recording an architectural or technical decision with context and alternatives |
| `meeting-note.md` | meeting | Capturing meeting agenda, discussion, decisions, and action items |
| `requirement.md` | requirement | Documenting a requirement with acceptance criteria and dependencies |
| `runbook.md` | runbook | Writing an operational procedure for incident response or maintenance |
| `daily-review.md` | daily | Daily standup or end-of-day review |
| `weekly-review.md` | weekly | Weekly retrospective and planning |
| `moc.md` | moc | Creating a Map of Content (index) for a project or area |

## Using Templates

### Step 1: Select Template

Match the note purpose to the template type. If no template fits, use the closest one and adapt, or create a plain `doc`-type note with minimal frontmatter.

### Step 2: Copy to Destination

Copy the template to the target directory, renaming it with a descriptive slug:

```bash
cp templates/adr.md vault/10-projects/foo/adr/adr-003-use-postgres.md
```

### Step 3: Fill Frontmatter

Replace all placeholder values (`YYYY-MM-DD`, empty strings, empty arrays) with actual data. Set `created` and `updated` to today's date.

### Step 4: Write Content

Replace section placeholder text with actual content. Remove sections that do not apply to this specific note (e.g., remove `## Rollback` from a runbook if rollback is not applicable).

### Step 5: Add Links

Add wiki-links to related notes in the `## Related` section and throughout the body where cross-references add value.

## Template Details

### ADR (`templates/adr.md`)

**Purpose:** Record a single architectural or technical decision.

**Key frontmatter fields:**
- `adr-id` — sequential identifier (e.g., `ADR-001`)
- `decided_at` — date when the decision was made (leave empty if still proposed)
- `deciders` — list of people involved in the decision
- `component` — system component affected
- `supersedes` / `superseded_by` — links to predecessor/successor ADRs

**Mandatory sections:** Context, Problem, Decision, Consequences, Alternatives Considered.

### Meeting Note (`templates/meeting-note.md`)

**Purpose:** Capture a meeting with agenda, discussion, decisions, and action items.

**Key frontmatter fields:**
- `date` / `time` — when the meeting took place
- `attendees` — list of participants
- `kind` — meeting type (`standup`, `planning`, `refinement`, `retro`, `review`, `workshop`, `ad-hoc`)
- `facilitator` — meeting leader

**Mandatory sections:** Agenda, Discussion, Decisions, Action Items.

### Requirement (`templates/requirement.md`)

**Purpose:** Document a functional or non-functional requirement with acceptance criteria.

**Key frontmatter fields:**
- `priority` — `critical`, `high`, `medium`, `low`
- `source` — who or what originated this requirement
- `acceptance_criteria` — list of testable criteria

**Mandatory sections:** Summary, Context, Requirements, Acceptance Criteria, Dependencies.

### Runbook (`templates/runbook.md`)

**Purpose:** Provide a step-by-step operational procedure for a specific scenario.

**Key frontmatter fields:**
- `service` — affected service or component
- `severity` — `critical`, `high`, `medium`, `low`
- `env` — target environment (`production`, `staging`, `dev`)
- `last_tested` — last date this runbook was tested
- `owner` — person or team responsible

**Mandatory sections:** When to Use, Prerequisites, Steps, Verification, Rollback.

### Daily Review (`templates/daily-review.md`)

**Purpose:** Track daily progress, blockers, and next-day plan.

**Key frontmatter fields:**
- `date` — review date
- `period` — always `daily`

**Mandatory sections:** Done, In Progress, Blocked, Notes, Tomorrow.

### Weekly Review (`templates/weekly-review.md`)

**Purpose:** Summarize the week, track decisions, plan next week.

**Key frontmatter fields:**
- `date` — review date (typically the last day of the week)
- `period` — always `weekly`

**Mandatory sections:** Summary, Completed, In Progress, Decisions Made, Next Week.

### MOC (`templates/moc.md`)

**Purpose:** Create a navigational index for a project or area.

**Key frontmatter fields:**
- `scope` — what this MOC covers (project name, area, domain)

**Mandatory sections:** Overview, Contents, Key Decisions, Status Summary.

## Customization

Adapt templates to project needs:

- **Add fields**: Add project-specific frontmatter fields (e.g., `client`, `sprint`, `repo`).
- **Remove sections**: Delete sections irrelevant to your context.
- **Rename sections**: Align with team terminology (e.g., `## Action Items` to `## Tasks`).
- **Add Dataview queries**: Insert `dataview` blocks in MOC templates for auto-generated indexes.

Keep customizations consistent across the vault. Document non-standard fields in `00-meta/patterns.md`.
