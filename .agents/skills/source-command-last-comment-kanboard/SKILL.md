---
name: "source-command-last-comment-kanboard"
description: "Берёт последний комментарий задачи Kanboard по URL или ID, выполняет инструкцию из комментария и отвечает через новый комментарий. Поддерживает многоходовой диалог через комментарии."
---

# source-command-last-comment-kanboard

Use this skill when the user asks to run the migrated source command `last-comment-kanboard`.

## Command Template

# Kanboard Comment-Based Workflow

Команда для итеративной работы с задачами через комментарии. Пользователь пишет инструкцию в комментарий → Codex выполняет → отвечает новым комментарием → цикл повторяется.

**Использование:**
```
/last-comment-kanboard <url_or_task_id>
```

**Примеры:**
```
/last-comment-kanboard 42
/last-comment-kanboard https://Codex.devar.ai/kanboard/?controller=TaskViewController&action=show&task_id=42&project_id=1
```

---

## Шаг 1: Получить задачу и последний комментарий

Извлечь TASK_ID из аргумента (число или из URL параметра `task_id=`):

```bash
source .env

# Получить задачу
curl -s -u "jsonrpc:$KANBOARD_API_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"getTask\",\"id\":1,\"params\":{\"task_id\":{ID}}}" \
  http://localhost:${KANBOARD_PORT:-6661}/jsonrpc.php

# Получить все комментарии
curl -s -u "jsonrpc:$KANBOARD_API_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"getAllComments\",\"id\":1,\"params\":{\"task_id\":{ID}}}" \
  http://localhost:${KANBOARD_PORT:-6661}/jsonrpc.php
```

Взять последний комментарий из массива (наибольший `date_creation`).

### Проверить автора последнего комментария

- Если комментариев нет → сообщить пользователю, попросить написать инструкцию в комментарий
- Если последний комментарий от агента (user_id = `$KANBOARD_AGENT_USER_ID`) → уведомить, что уже ответили на последний комментарий, ждать новой инструкции
- Если комментарий от пользователя → продолжить выполнение

---

## Шаг 2: Определить контур из задачи

**ОБЯЗАТЕЛЬНО** прочитай описание задачи и определи контур:

| Контур | Рабочий путь | Git ветка | URL |
|--------|--------------|-----------|-----|
| **Codex** | `/var/www/Codex.devar.ai` | `Codex` | Codex.devar.ai |
| **stage** | `/var/www/test.devar.ai` | `stage` | test.devar.ai |
| **dev** | `/var/www/dev.devar.ai` | `dev` | dev.devar.ai |
| **prod** | `/var/www/app.devar.ai` | `main` | app.devar.ai |

Если контур не указан явно — уточни у пользователя или используй `Codex` по умолчанию.

---

## Шаг 3: Прочитать контекст задачи

Если есть `llm-temp/{ID}/` — прочитай:
- `task.md` — исходная задача
- `memory.md` — решения предыдущих сессий
- `result.md` — что уже сделано

Если vault есть — `kanboard/vaults/10-tasks/task-{ID}/`:
- `00-index.md`, `result.md`, `memory.md`

---

## Шаг 4: Выполнить инструкцию из комментария

Следуй инструкции из последнего комментария. По ходу работы:

### Записывай в timeline (если файл есть):
```bash
echo "| $(date '+%Y-%m-%d %H:%M') | comment_in | agent=last-comment-kanboard | <суть инструкции> |" >> llm-temp/{ID}/timeline.md
```

### Коммиты — постить в Kanboard:
```bash
HASH=$(git log -1 --format="%h")
MSG=$(git log -1 --format="%s")
FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | head -5 | tr '\n' ', ')
bash kanboard/connector/post-comment.sh {ID} "📝 Commit: $HASH
$MSG
Files: $FILES"
```

### Если нужна дополнительная информация — спроси через комментарий:
```bash
bash kanboard/connector/post-comment.sh {ID} "❓ Уточнение: <вопрос>"
```
И завершай — пользователь ответит новым комментарием.

---

## Шаг 5: Обновить память задачи

Если задача сложная или было принято важное решение — дозапиши в `llm-temp/{ID}/memory.md`:

```markdown
## {YYYY-MM-DD HH:MM} — {заголовок}
**Решение:** ...
**Причина:** ...
**Файлы:** path/to/file.ts:42
```

---

## Шаг 6: Ответить через комментарий

```bash
bash kanboard/connector/post-comment.sh {ID} "<результат>"
```

### Формат ответа — успех:
```
✅ Готово!

**Выполнено:**
- Действие 1
- Действие 2

**Изменённые файлы:**
- path/to/file.ts:10-25

**Как проверить:**
- шаг 1
- шаг 2
```

### Формат ответа — частично:
```
⚠️ Выполнено частично

**Сделано:**
- [что удалось]

**Проблема:**
- [что не удалось и почему]

**Нужно:**
- [что требуется для завершения]
```

### Формат ответа — ошибка:
```
❌ Не удалось выполнить

**Проблема:** [описание]

**Что пробовал:**
- [попытки]

**Требуется:** [что нужно от пользователя]
```

---

## Правила

- **Всегда** проверяй — не отвечал ли агент уже на последний комментарий
- **Не удаляй** существующие файлы памяти, только дополняй
- Если задача требует полного workflow (brainstorm → plan → execute) — используй `/kanboard-task` вместо этой команды
- Эта команда для **итеративных доработок** по существующей или простой задаче
- Коммиты — без AI-подписей, стандартный conventional commits формат
