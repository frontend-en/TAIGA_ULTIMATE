---
name: "source-command-improve-scene"
description: "Manually trigger scene improvement for a given improvement ID or chat publicId. Runs the 5-phase improve-scene skill with visual QA loop."
---

# source-command-improve-scene

Use this skill when the user asks to run the migrated source command `improve-scene`.

## Command Template

# /improve-scene

Manual trigger for the scene improvement pipeline (debugging utility).

## Usage

```
/improve-scene {IMPROVEMENT_ID}
/improve-scene chat:{CHAT_PUBLIC_ID}
```

## Behavior

1. Resolve target:
   - If arg looks like a Mongo ObjectId (24 hex chars) → treat as `IMPROVEMENT_ID`.
   - If prefixed with `chat:` → resolve via MongoDB to the latest `scene_improvements` for that chat.
2. Load the Kanboard task for this improvement if it exists; otherwise operate from Mongo data directly.
3. Execute the `improve-scene` skill end-to-end:
   - Phase 1 — download assets
   - Phase 2 — brainstorm
   - Phase 3 — fix
   - Phase 4 — visual verify via `scene-improver` agent (MCP chrome-devtools)
   - Phase 5 — iterate up to 3 times
4. Report final status + path to `llm-temp/{IMPROVEMENT_ID}/`.

## Resolve by chat publicId

```bash
docker exec mywebar-Codex-mongodb mongosh mywebar-ai-Codex --quiet --eval '
  const chat = db.chats.findOne({publicId: "{CHAT_PUBLIC_ID}"}, {_id:1});
  if (!chat) { print("no chat"); quit(); }
  const imp = db.scene_improvements.find({chatId: chat._id}).sort({createdAt:-1}).limit(1).toArray()[0];
  printjson({improvementId: imp ? imp._id.toString() : null, status: imp?.status});
'
```

## Invocation

Delegate the entire run to the skill:
```
Skill(skill="improve-scene", args="IMPROVEMENT_ID={id}")
```
