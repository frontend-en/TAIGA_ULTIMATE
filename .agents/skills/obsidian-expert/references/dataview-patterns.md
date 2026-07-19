# Dataview Patterns Reference

## DQL Basics

Dataview Query Language (DQL) blocks render dynamic views of vault content based on frontmatter fields.

Query structure:

```
```dataview
QUERY_TYPE field1, field2 AS "Label"
FROM "folder" OR #tag
WHERE condition
SORT field ASC|DESC
GROUP BY field
LIMIT N
```
```

Query types: `TABLE`, `LIST`, `TASK`, `CALENDAR`.

## Common DQL Patterns

### Project Dashboard

```dataview
TABLE status, priority, owner
FROM "10-projects"
WHERE type = "moc"
SORT status ASC
```

### ADR Index

```dataview
TABLE adr-id, status, component, decided_at AS "Decided"
FROM "10-projects/project-name/adr"
WHERE type = "adr"
SORT adr-id ASC
```

### Recent Meeting Notes

```dataview
TABLE date, kind, attendees
FROM "10-projects/project-name/notes"
WHERE type = "meeting"
SORT date DESC
LIMIT 10
```

### Active Runbooks by Service

```dataview
TABLE service, severity, env, last_tested AS "Last Tested"
FROM "10-projects"
WHERE type = "runbook" AND status = "active"
SORT service ASC
```

### Notes Without Status

```dataview
LIST
FROM "10-projects"
WHERE !status
SORT file.name ASC
```

### Open Tasks Across Projects

```dataview
TASK
FROM "10-projects"
WHERE !completed
GROUP BY file.link
```

### Notes by Tag

```dataview
TABLE type, status, file.folder AS "Location"
FROM #architecture
SORT type ASC
```

## DataviewJS Patterns

Use DataviewJS when DQL is insufficient: multi-table layouts, complex grouping, conditional rendering.

### Grouped Tables by Owner

```dataviewjs
const pages = dv.pages('"10-projects"')
  .where(p => p.type === "requirement" && p.status !== "done");

const groups = pages.groupBy(p => p.project ?? "Unassigned");

for (const group of groups) {
  dv.header(3, group.key);
  dv.table(
    ["Requirement", "Priority", "Status"],
    group.rows.map(p => [p.file.link, p.priority, p.status])
  );
}
```

### Stale Runbooks Alert

```dataviewjs
const cutoff = dv.date("today").minus({ months: 3 });
const stale = dv.pages('"10-projects"')
  .where(p => p.type === "runbook" && p.last_tested && dv.date(p.last_tested) < cutoff);

if (stale.length > 0) {
  dv.header(3, "Runbooks not tested in 3+ months");
  dv.table(
    ["Runbook", "Service", "Last Tested"],
    stale.map(p => [p.file.link, p.service, p.last_tested])
  );
} else {
  dv.paragraph("All runbooks tested recently.");
}
```

### Decision Log from Meeting Notes

```dataviewjs
const meetings = dv.pages('"10-projects/project-name/notes"')
  .where(p => p.type === "meeting")
  .sort(p => p.date, "desc");

dv.table(
  ["Date", "Meeting", "Kind"],
  meetings.map(p => [p.date, p.file.link, p.kind])
);
```

## Dashboard Note Pattern

Create a `00-meta/dashboard.md` note combining multiple queries:

```markdown
---
title: "Dashboard"
type: moc
status: active
---

# Dashboard

## Active Projects
<!-- TABLE query for projects with status = active -->

## Pending Decisions
<!-- TABLE query for ADRs with status = proposed -->

## Stale Runbooks
<!-- DataviewJS for runbooks with old last_tested -->

## Orphan Notes
<!-- LIST query for notes missing type or project -->
```

## Tips

- Use `FROM "folder"` to scope queries. Avoid vault-wide queries in large vaults.
- `FLATTEN` splits array fields (e.g., `tags`, `attendees`) into individual rows for per-item grouping.
- Date comparisons use `dv.date("today")` in DataviewJS; in DQL use `date(today)`.
- Property names with hyphens (e.g., `adr-id`) work in DQL but require bracket notation in DataviewJS: `p["adr-id"]`.
