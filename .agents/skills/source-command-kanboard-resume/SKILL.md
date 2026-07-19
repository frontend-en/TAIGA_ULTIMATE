---
name: "source-command-kanboard-resume"
description: "Восстанавливает контекст задачи из llm-temp/{task_id}/ и vault, продолжает работу с учётом нового комментария. Ведёт timeline, постит коммиты. По завершении обновляет vault и переводит в Review."
---

# source-command-kanboard-resume

Use this skill when the user asks to run the migrated source command `kanboard-resume`.

## Command Template

# Kanboard Resume Agent

Ты агент, который **возобновляет** работу над задачей после комментария от человека. Вся память лежит в `llm-temp/{TASK_ID}/` и `kanboard/vaults/10-tasks/task-{TASK_ID}/`.

**Ключевые пути (замени `{ID}` на реальный TASK_ID):**
- `llm-temp/{ID}/` — память по задаче
- `kanboard/vaults/10-tasks/task-{ID}/` — Obsidian vault (если создан)
- `kanboard/connector/post-comment.sh {ID} "текст"` — комментарий в Kanboard

## Шаг 0: Оповестить и записать в timeline

```bash
bash kanboard/connector/post-comment.sh {ID} "🤖 Получил комментарий, восстанавливаю контекст..."
echo "| $(date '+%Y-%m-%d %H:%M') | session_resume | agent=kanboard-resume | Resume after comment |" >> llm-temp/{ID}/timeline.md
```

## Шаг 1: Восстановить полный контекст

Прочитай всё из `llm-temp/{ID}/`:

| Файл | Что в нём |
|---|---|
| `task.md` | описание задачи |
| `brainstorm.md` | мозговой штурм |
| `plan.md` | план реализации |
| `memory.md` | **ключевой** — все решения между сессиями |
| `result.md` | что сделано ранее |
| `comments.md` | комментарии, **последний — самый важный** |
| `timeline.md` | хронология — какие агенты/скиллы работали |
| `status.json` | текущий статус |

Если есть vault (`kanboard/vaults/10-tasks/task-{ID}/`), прочитай `00-index.md` — там связи с другими задачами.

### Кросс-ссылки

Проверь последний комментарий и описание на ссылки `#N`, `task/N`, `Task #N`.
Для каждой — прочитай vault/llm-temp связанной задачи и используй контекст.

```bash
echo "| $(date '+%Y-%m-%d %H:%M') | cross_ref | agent=kanboard-resume | Read task #{N} |" >> llm-temp/{ID}/timeline.md
```

## Шаг 2: Понять запрос

Прочитай последний комментарий в `comments.md`. Определи тип:
- **Доработка** — добавить/изменить
- **Исправление** — починить
- **Уточнение** — объяснить
- **Новое требование** — новая функциональность

```bash
bash kanboard/connector/post-comment.sh {ID} "📖 Понимаю запрос: <одно предложение>. Приступаю."
```

## Шаг 3: Выполнить работу

**ОБЯЗАТЕЛЬНО по ходу работы:**

### 3.1 Memory — append в конец
```markdown
## Resume {YYYY-MM-DD HH:MM}
**Запрос:** <резюме комментария>
**Решения:** ...
**Изменения:** path/to/file:42
```

### 3.2 Timeline — на каждом шаге
```bash
echo "| $(date '+%Y-%m-%d %H:%M') | <event> | agent=kanboard-resume skill=<skill> | <details> |" >> llm-temp/{ID}/timeline.md
```

### 3.3 Коммиты — ПОСТИТЬ В KANBOARD
После каждого `git commit`:
```bash
HASH=$(git log -1 --format="%h")
MSG=$(git log -1 --format="%s")
FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | head -5 | tr '\n' ', ')
echo "| $(date '+%Y-%m-%d %H:%M') | commit | agent=kanboard-resume | $HASH: $MSG |" >> llm-temp/{ID}/timeline.md
bash kanboard/connector/post-comment.sh {ID} "📝 Commit: $HASH
$MSG
Files: $FILES"
```

### 3.4 Апдейты в Kanboard
Раз в ~5 минут:
```bash
bash kanboard/connector/post-comment.sh {ID} "✅ <что сделано>"
```

## Шаг 4: Обновить result.md

Добавь раздел (не перезаписывай старые):
```markdown
## Resume session {YYYY-MM-DD HH:MM}

### В ответ на комментарий
> <цитата>

### Что сделано
- ...

### Коммиты этой сессии
- `<hash>` <message>
```

## Шаг 5: Обновить vault и перевести в Review

```bash
echo "| $(date '+%Y-%m-%d %H:%M') | vault_update | agent=kanboard-resume | Updating vault |" >> llm-temp/{ID}/timeline.md
bash kanboard/scripts/finalize-vault.sh {ID}
```

Переведи в Review:
```bash
source .env
TASK_JSON=$(curl -s -u "jsonrpc:$KANBOARD_API_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"getTask\",\"id\":1,\"params\":{\"task_id\":{ID}}}" \
  http://localhost:${KANBOARD_PORT}/jsonrpc.php)
PROJECT_ID=$(echo "$TASK_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['project_id'])")
COL_REVIEW_ID=$(curl -s -u "jsonrpc:$KANBOARD_API_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"getColumns\",\"id\":1,\"params\":{\"project_id\":$PROJECT_ID}}" \
  http://localhost:${KANBOARD_PORT}/jsonrpc.php \
  | python3 -c "import sys,json; cols=json.load(sys.stdin)['result']; print([c['id'] for c in cols if c['title']=='Review'][0])")
curl -s -u "jsonrpc:$KANBOARD_API_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"moveTaskPosition\",\"id\":1,\"params\":{\"project_id\":$PROJECT_ID,\"task_id\":{ID},\"column_id\":$COL_REVIEW_ID,\"position\":1,\"swimlane_id\":1}}" \
  http://localhost:${KANBOARD_PORT}/jsonrpc.php

echo "| $(date '+%Y-%m-%d %H:%M') | task_complete | agent=kanboard-resume | Moved to Review |" >> llm-temp/{ID}/timeline.md
```

Обнови `status.json`:
```json
{"status": "Review", "updatedAt": "<ISO>"}
```

Твой **последний stdout** уйдёт в Kanboard как комментарий. Заверши содержательно.

## Если застрял

1. `memory.md` — запиши вопрос
2. `status.json`: `"status": "InProgress", "blocked": "<причина>"`
3. ```bash
   echo "| $(date '+%Y-%m-%d %H:%M') | task_blocked | agent=kanboard-resume | <причина> |" >> llm-temp/{ID}/timeline.md
   bash kanboard/connector/post-comment.sh {ID} "❓ Нужно уточнение: <вопрос>"
   ```

## Важные правила

- **НИКОГДА не удаляй файлы** из `llm-temp/{ID}/`
- `memory.md`, `timeline.md`, `result.md` — append-only
- **Каждый коммит** — постить в Kanboard + timeline
- **Vault** — обновлять через `finalize-vault.sh` при завершении
- **Кросс-ссылки** — читать vault/llm-temp связанных задач
- Комментарии — часто и коротко
