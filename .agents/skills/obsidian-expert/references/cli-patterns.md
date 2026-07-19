# CLI Patterns Reference

## Search Recipes

### Find Notes by Type

```bash
# All MOC/index files
find vault/ -name "00-index.md"

# All ADRs in a project
grep -rl 'type: adr' vault/10-projects/project-name/

# All runbooks across the vault
grep -rl 'type: runbook' vault/

# All meeting notes for a specific project
grep -rl 'type: meeting' vault/10-projects/project-name/notes/
```

### Filter by Status

```bash
# All active documents
grep -rl 'status: active' vault/

# All proposed ADRs (pending decisions)
grep -rl 'status: proposed' vault/10-projects/

# All deprecated documents (candidates for archiving)
grep -rl 'status: deprecated' vault/
```

### Content Search

```bash
# Search for a term across the vault
grep -rn 'event sourcing' vault/ --include='*.md'

# Search within a specific section heading
grep -A 10 '^## Decision' vault/10-projects/*/adr/*.md

# Find notes mentioning a specific wiki-link
grep -rl '\[\[project-foo\]\]' vault/
```

## Validation Recipes

### Frontmatter Checks

```bash
# Files without frontmatter (no opening ---)
find vault/ -name '*.md' -exec sh -c '
  head -1 "$1" | grep -q "^---$" || echo "$1"
' _ {} \;

# Files missing the type field
find vault/ -name '*.md' -exec sh -c '
  grep -q "^type:" "$1" || echo "missing type: $1"
' _ {} \;

# Files missing the status field
find vault/ -name '*.md' -exec sh -c '
  grep -q "^status:" "$1" || echo "missing status: $1"
' _ {} \;
```

### Structural Checks

```bash
# Directories without an index file
find vault/10-projects/ -mindepth 1 -maxdepth 1 -type d -exec sh -c '
  [ -f "$1/00-index.md" ] || echo "no index: $1"
' _ {} \;

# Orphan notes (not linked from any other note)
for f in $(find vault/ -name '*.md'); do
  slug=$(basename "$f" .md)
  grep -rq "\[\[$slug\]\]" vault/ || echo "orphan: $f"
done

# Empty notes (only frontmatter, no content)
find vault/ -name '*.md' -exec sh -c '
  lines=$(sed "/^---$/,/^---$/d" "$1" | grep -c ".")
  [ "$lines" -lt 2 ] && echo "empty: $1"
' _ {} \;
```

## Bulk Operations

### Update Timestamps

```bash
# Update the "updated" field to today in a specific file
sed -i '' "s/^updated:.*/updated: $(date +%Y-%m-%d)/" vault/path/to/note.md

# Bulk update all notes in a directory
find vault/10-projects/foo/ -name '*.md' -exec \
  sed -i '' "s/^updated:.*/updated: $(date +%Y-%m-%d)/" {} \;
```

### Add Missing Fields

```bash
# Add a missing "status: draft" field after the type field
find vault/ -name '*.md' -exec sh -c '
  grep -q "^status:" "$1" || sed -i "" "/^type:/a\\
status: draft" "$1"
' _ {} \;
```

### Rename and Move

```bash
# Move completed project to archive
mv vault/10-projects/old-project/ vault/40-archive/

# Rename a note and update references
OLD="old-slug"; NEW="new-slug"
mv "vault/path/$OLD.md" "vault/path/$NEW.md"
grep -rl "\[\[$OLD\]\]" vault/ | xargs sed -i '' "s/\[\[$OLD\]\]/\[\[$NEW\]\]/g"
```

## Report Generation

### Vault Statistics

```bash
# Count notes by type
for t in doc adr howto spec moc meeting runbook requirement daily weekly; do
  count=$(grep -rl "type: $t" vault/ | wc -l | tr -d ' ')
  echo "$t: $count"
done

# Count notes by status
for s in draft active deprecated accepted proposed rejected superseded done; do
  count=$(grep -rl "status: $s" vault/ | wc -l | tr -d ' ')
  [ "$count" -gt 0 ] && echo "$s: $count"
done
```

### Link Analysis

```bash
# List all outgoing wiki-links from a note
grep -o '\[\[[^]]*\]\]' vault/path/to/note.md | sort -u

# Find broken links (referenced but no matching file)
grep -roh '\[\[[^]]*\]\]' vault/ | sort -u | while read link; do
  slug=$(echo "$link" | sed 's/\[\[//;s/\]\]//')
  find vault/ -name "$slug.md" | grep -q . || echo "broken: $link"
done

# Most-linked notes (popularity)
grep -roh '\[\[[^]]*\]\]' vault/ | sort | uniq -c | sort -rn | head -20
```

## Useful Pipelines

```bash
# List all ADRs with their status (tab-separated)
grep -rl 'type: adr' vault/ | while read f; do
  status=$(grep '^status:' "$f" | head -1 | awk '{print $2}')
  echo -e "$status\t$f"
done | sort

# Daily dashboard: today's meetings and open tasks
echo "=== Meetings ==="
grep -rl "date: $(date +%Y-%m-%d)" vault/ | grep -i meet
echo "=== Open Tasks ==="
grep -rn '^\- \[ \]' vault/10-projects/ --include='*.md'

# Project health: notes per project directory
for d in vault/10-projects/*/; do
  count=$(find "$d" -name '*.md' | wc -l | tr -d ' ')
  echo "$count notes: $(basename $d)"
done | sort -rn
```

## Notes

- All examples use `find` and `grep` (POSIX). Replace with `fd` and `rg` (ripgrep) for faster execution on large vaults.
- macOS `sed` uses `-i ''` (empty backup extension). Linux `sed` uses `-i` without the extra argument.
- Wrap file paths in double quotes to handle edge cases with special characters.
