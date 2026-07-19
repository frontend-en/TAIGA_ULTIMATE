---
name: obsidian-expert
description: >
  This skill should be used when the user asks to "create a note", "organize vault",
  "set up Obsidian vault", "create MOC", "write meeting note", "create ADR",
  "validate vault", "find orphan notes", "create runbook", "search vault",
  "create requirement", "write daily review", "write weekly review",
  "create specification", "find broken links", "audit vault",
  "create index", "create dashboard",
  "organize knowledge base", "set up project KB",
  mentions "Obsidian vault", "knowledge base", "MOC", "Map of Content",
  "frontmatter schema", "dataview query", "note template", "vault maintenance",
  "vault structure", "vault architecture",
  or when managing a project knowledge base stored as markdown files
  accessible through the file system (find, grep, cat).
version: 1.0.0
---

# Obsidian Expert

## Overview

This skill serves two roles:

1. **Vault organizer** — create notes, design vault structure, apply templates, manage frontmatter metadata, and maintain consistency across the knowledge base.
2. **Knowledge base operator** — treat the vault as an AI-readable file system, searching and analyzing content through CLI tools (find, grep, cat, sed) without requiring Obsidian GUI or plugins.

Five core capabilities:

- **Structure** — design and maintain canonical vault directory layout with numeric prefixes, MOCs, and kebab-case naming.
- **Create** — generate notes from templates with proper frontmatter, section headings, and cross-references.
- **Search** — find notes by type, status, content, and links using CLI patterns.
- **Validate** — detect missing frontmatter, orphan notes, broken links, and structural violations.
- **Maintain** — archive stale content, update MOCs, refactor structure, and enforce conventions.

An Obsidian vault is a directory of markdown files. Every operation in this skill works through the file system — no Obsidian GUI, plugins, or APIs required.

## Vault Architecture

Organize the vault with a PARA-inspired layout using numeric prefixes for predictable sort order:

```text
vault/
  00-meta/                  # Global indexes, glossary, patterns
    00-index.md             # Home MOC (vault entry point)
  10-projects/              # Active projects
    project-name/
      00-index.md           # Project MOC
      adr/                  # Architecture Decision Records
      specs/                # Specifications
      notes/                # Design and meeting notes
      runbooks/             # Operational playbooks
      api/                  # API documentation
  20-areas/                 # Ongoing responsibilities
  30-resources/             # Reusable knowledge
  40-archive/               # Completed projects, stale content
  templates/                # Note templates
```

Naming rules:

- **Lowercase kebab-case** for all files and directories — no spaces, no camelCase.
- **Numeric prefixes** (`00-`, `10-`, `20-`, `30-`, `40-`) on top-level folders for consistent sort order.
- **Max 3 levels** of directory nesting. Use wiki-links instead of deeper folders.
- **`00-index.md`** in every project and area directory as the local MOC (entry point).
- **Date prefix** (`YYYY-MM-DD-slug.md`) for chronological notes (meetings, dailies).

For the complete directory tree, multi-project layouts, embedded vault patterns, and anti-patterns, consult `references/vault-structure.md`.

## Frontmatter Schema

Every note requires YAML frontmatter with these mandatory fields:

| Field | Format | Example |
| ----- | ------ | ------- |
| `title` | String | `"API Design Overview"` |
| `type` | Enum | `doc` |
| `status` | Enum | `active` |
| `created` | Date | `2026-03-13` |
| `updated` | Date | `2026-03-13` |

**Type values:** `doc`, `adr`, `howto`, `spec`, `moc`, `meeting`, `runbook`, `requirement`, `daily`, `weekly`.

**Status values:** `draft`, `active`, `deprecated`, `done` (general); `accepted`, `proposed`, `rejected`, `superseded` (ADR-specific).

Recommended optional fields: `project`, `scope`, `tags`, `related`.

Each note type has additional type-specific fields:

| Type | Key Fields |
| ---- | ---------- |
| `adr` | `adr-id`, `decided_at`, `deciders`, `component`, `supersedes`, `superseded_by` |
| `meeting` | `date`, `time`, `attendees`, `kind`, `facilitator` |
| `requirement` | `priority`, `source`, `acceptance_criteria` |
| `runbook` | `service`, `severity`, `env`, `last_tested`, `owner` |
| `daily` | `date`, `period` |
| `weekly` | `date`, `period` |
| `moc` | `scope` |

Store all metadata in frontmatter (not inline `key:: value`). Keep property names lowercase with hyphens.

For the complete schema with examples for every type, consult `references/frontmatter-schema.md`.

## Note Creation Workflow

Follow these seven steps when creating any note:

### 1. Determine Note Type

Identify which type fits the purpose: `adr` for decisions, `meeting` for protocols, `runbook` for operations, `requirement` for specs, `moc` for indexes, `daily`/`weekly` for reviews, `doc` for everything else.

### 2. Select Template

Pick the matching template from `templates/`. Copy it to the target directory with a descriptive kebab-case filename:

```bash
cp templates/adr.md vault/10-projects/foo/adr/adr-003-use-postgres.md
```

### 3. Fill Frontmatter

Replace all placeholder values. Set `created` and `updated` to today's date. Fill type-specific fields.

### 4. Write Summary

Write the first paragraph as a self-contained summary. Include project name, domain, and key terms. This paragraph is what CLI searches and AI assistants see first.

### 5. Fill Sections

Replace placeholder text in each section. Use the standardized heading names from the template (e.g., `## Context`, `## Decision`, `## Consequences` for ADRs). Remove inapplicable sections.

### 6. Add Cross-References

Insert `[[wiki-links]]` to related notes in the body and in the `## Related` section. Link both ways: if note A references note B, note B should reference note A.

### 7. Update MOC

Add a link to the new note in the relevant `00-index.md` (project MOC) and any topic MOC where it belongs.

For template descriptions, field requirements, and customization guidance, consult `references/templates-catalog.md`.

## CLI Search Patterns

Search and analyze the vault through standard CLI tools. Use `find` for structure, `grep` for content.

| Task | Command |
| ---- | ------- |
| Find all MOC/index files | `find vault/ -name "00-index.md"` |
| All ADRs in a project | `grep -rl 'type: adr' vault/10-projects/foo/` |
| Filter by status | `grep -rl 'status: active' vault/` |
| Search content | `grep -rn 'event sourcing' vault/ --include='*.md'` |
| Find notes mentioning a link | `grep -rl '\[\[note-slug\]\]' vault/` |
| Files without frontmatter | `find vault/ -name '*.md' -exec sh -c 'head -1 "$1" \| grep -q "^---$" \|\| echo "$1"' _ {} \;` |
| Files missing type field | `find vault/ -name '*.md' -exec sh -c 'grep -q "^type:" "$1" \|\| echo "$1"' _ {} \;` |
| Directories without index | `find vault/10-projects/ -mindepth 1 -maxdepth 1 -type d -exec sh -c '[ -f "$1/00-index.md" ] \|\| echo "$1"' _ {} \;` |
| Orphan notes (unreferenced) | Loop: extract slug, `grep -rq` for `[[slug]]`, report if missing |
| Count notes by type | Loop over type enum values, `grep -rl "type: $t" vault/ \| wc -l` |

Replace `find`/`grep` with `fd`/`rg` (ripgrep) for faster execution on large vaults.

For the complete CLI recipe catalog with bulk operations, report generation, and pipelines, consult `references/cli-patterns.md`.

## Vault Maintenance

### Validation

Run periodic checks to keep the vault healthy:

1. **Frontmatter completeness** — verify every `.md` file has `title`, `type`, `status`, `created`, `updated`.
2. **Orphan detection** — find notes not linked from any other note or MOC.
3. **Broken links** — extract all `[[wiki-links]]`, verify each target file exists.
4. **Structural compliance** — confirm every project/area directory has `00-index.md`.
5. **Empty notes** — find notes with frontmatter but no meaningful body content.

### MOC Updates

After creating, moving, or deleting notes:

1. Update the project `00-index.md` to reflect the current contents.
2. Update topic MOCs in `20-areas/` if the note belongs to a cross-cutting area.
3. Update `00-meta/00-index.md` if a new project or area was created.

### Archiving

Move completed projects and stale content to `40-archive/`:

1. Set `status: deprecated` on all notes in the project.
2. Move the entire project directory: `mv vault/10-projects/old/ vault/40-archive/old/`.
3. Remove links to archived notes from active MOCs.
4. Mark superseded ADRs as `status: superseded` and set the `superseded_by` field.

### Refactoring

When the vault structure needs reorganization:

1. Plan the target structure before moving any files.
2. Move files to new locations.
3. Update all `[[wiki-links]]` that reference moved files: `grep -rl '\[\[old-slug\]\]' vault/ | xargs sed -i '' 's/\[\[old-slug\]\]/\[\[new-slug\]\]/g'`.
4. Rebuild affected MOCs.
5. Run validation checks to confirm no broken links remain.

## Dataview Integration

For vaults with the Dataview plugin, embed dynamic queries in MOC and dashboard notes.

**Project dashboard:**

```dataview
TABLE status, priority, owner
FROM "10-projects"
WHERE type = "moc"
SORT status ASC
```

**ADR index:**

```dataview
TABLE adr-id, status, component, decided_at AS "Decided"
FROM "10-projects/project-name/adr"
WHERE type = "adr"
SORT adr-id ASC
```

**Stale runbooks (DataviewJS):**

```dataviewjs
const cutoff = dv.date("today").minus({ months: 3 });
const stale = dv.pages('"10-projects"')
  .where(p => p.type === "runbook" && p.last_tested && dv.date(p.last_tested) < cutoff);
if (stale.length > 0) {
  dv.table(["Runbook", "Service", "Last Tested"],
    stale.map(p => [p.file.link, p.service, p.last_tested]));
}
```

For the complete query library with task tracking, meeting aggregation, and dashboard patterns, consult `references/dataview-patterns.md`.

## AI-Readability Conventions

Follow these five rules to ensure the vault is efficiently consumable by AI assistants via CLI:

1. **Summary first** — begin every note with a self-contained summary paragraph. Include project name, domain terms, and purpose. This is the first thing `head -20` or `cat` reveals.

2. **Standardized headings** — use consistent section headings by type (e.g., `## Context`, `## Decision`, `## Consequences` for ADRs; `## Agenda`, `## Decisions`, `## Action Items` for meetings). This enables `grep -A N '^## Decision'` across multiple files.

3. **Frontmatter for metadata** — store all structured data (type, status, dates, people, tags) in YAML frontmatter, not as inline tags or body text. Frontmatter is machine-parseable with simple `grep` patterns.

4. **Wiki-links for navigation** — use `[[slug]]` links. AI assistants can extract them with `grep -o '\[\[[^]]*\]\]'` and follow them by resolving the slug to a filename.

5. **Self-contained notes** — each note should be understandable without reading its siblings. Include enough context in the summary and body so that `cat note.md` provides complete information.

## Quick Reference

| Operation | Approach |
| --------- | -------- |
| Create a note | Select template, copy, fill frontmatter, write content, link from MOC |
| Find notes by type | `grep -rl 'type: adr' vault/` |
| Validate vault | Check frontmatter, orphans, broken links, missing indexes |
| Update MOC | Add/remove links in `00-index.md` after note changes |
| Archive a project | Set deprecated status, move to `40-archive/`, clean MOCs |
| Search content | `grep -rn 'term' vault/ --include='*.md'` |
| Create project | `mkdir -p vault/10-projects/name/{adr,specs,notes,runbooks}`, create `00-index.md` |
| Bulk update | `find` + `sed` for frontmatter field changes across multiple files |

## Additional Resources

For detailed patterns and extended guidance, consult:

- **`references/vault-structure.md`** — complete directory trees, multi-project layouts, embedded vault patterns, anti-patterns
- **`references/frontmatter-schema.md`** — full field specification per note type, enum values, validation rules, examples
- **`references/cli-patterns.md`** — search, validation, bulk operations, report generation, and pipeline recipes
- **`references/templates-catalog.md`** — template descriptions, usage instructions, field requirements, customization guide
- **`references/dataview-patterns.md`** — DQL and DataviewJS query library for dashboards, indexes, and reports

Note templates ready to use:

- **`templates/adr.md`** — Architecture Decision Record
- **`templates/meeting-note.md`** — Meeting protocol
- **`templates/requirement.md`** — Requirement with acceptance criteria
- **`templates/runbook.md`** — Operational runbook
- **`templates/daily-review.md`** — Daily review
- **`templates/weekly-review.md`** — Weekly review
- **`templates/moc.md`** — Map of Content (index)
