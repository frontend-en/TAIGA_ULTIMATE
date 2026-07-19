# Common Bug Patterns — Devar AI Studio

## React / Next.js

### Stale closure in hooks
```tsx
// BUG: messages is stale inside the callback
useEffect(() => {
  socket.on('message', (msg) => {
    setMessages([...messages, msg]); // messages is captured at mount time
  });
}, []); // missing messages dependency, but adding it causes infinite loop

// FIX: use functional updater
setMessages(prev => [...prev, msg]);
```

### Missing cleanup
```tsx
// BUG: event listener leaks on unmount
useEffect(() => {
  window.addEventListener('resize', handler);
  // missing return () => window.removeEventListener('resize', handler);
}, []);
```

### AbortController not skipped
```tsx
// BUG: planning API calls get cancelled on route change
// FIX: add __skipGlobalAbort: true to config
await api.post('/api/planning/auto-plan', data, { __skipGlobalAbort: true });
```

## MongoDB / Mongoose

### TOCTOU race
```typescript
// BUG: document can change between find and update
const doc = await Model.findOne({ id });
doc.field = newValue;
await doc.save(); // another request may have changed doc

// FIX: use findOneAndUpdate with atomic operators
await Model.findOneAndUpdate({ id }, { $set: { field: newValue } });
```

### Array index in $set path
```typescript
// BUG: index can be stale if array was modified concurrently
$set[`items.${index}.name`] = newName;

// FIX: use arrayFilters for stable targeting
await Model.findOneAndUpdate(
  { _id: docId },
  { $set: { 'items.$[elem].name': newName } },
  { arrayFilters: [{ 'elem.id': targetId }] }
);
```

## Express.js Backend

### Missing async error handling
```typescript
// BUG: unhandled rejection crashes the process
router.get('/', async (req, res) => {
  const data = await riskyOperation(); // throws → 500 with no response
  res.json(data);
});

// FIX: wrap in try/catch or use asyncHandler
router.get('/', async (req, res, next) => {
  try {
    const data = await riskyOperation();
    res.json(data);
  } catch (error) {
    next(error); // passes to error handler middleware
  }
});
```

### Auth bypass on new routes
```typescript
// BUG: new route added before auth middleware
app.use('/api/new-feature', newFeatureRoutes); // no auth!
app.use(authMiddleware);

// FIX: apply auth middleware to the route
router.use(authMiddleware);
```

## TypeScript

### Unsafe any cast hiding bugs
```typescript
// BUG: concept might not have assets field
const assets = (concept as any).assets; // no null check

// FIX: proper type guard
if (concept && Array.isArray((concept as Record<string, unknown>).assets)) {
  const assets = (concept as { assets: Asset[] }).assets;
}
```

### Optional chaining masking undefined
```typescript
// BUG: silently returns undefined instead of throwing
const name = user?.profile?.name; // undefined if user is null
displayName(name); // displayName doesn't handle undefined

// FIX: provide fallback or check explicitly
const name = user?.profile?.name ?? 'Unknown';
```

## SSE / Streaming

### Missing SSE cleanup
```typescript
// BUG: SSE connection stays open after component unmount
const evtSource = new EventSource('/api/stream');
// missing evtSource.close() on cleanup

// FIX: close in useEffect cleanup
useEffect(() => {
  const evtSource = new EventSource('/api/stream');
  return () => evtSource.close();
}, []);
```

## Docker / Infrastructure

### Volume mount file change detection
```yaml
# BUG: nodemon in Docker doesn't detect file changes via volume mount
# FIX: need docker restart after backend file changes
# Or use polling: nodemon --legacy-watch
```
