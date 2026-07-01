## When to use

Reach for a **wizard** when a recommendation depends on a few facts you don't have
yet — risk appetite, time horizon, what the customer is saving for. Instead of
asking everything in prose, the wizard collects answers one question at a time and
posts a tidy `Q: … / A: …` summary back into the thread.

## How branching works

Each option may carry a `next` pointing at another question id. Omit `next` to make
the option **terminal** — picking it shows *Submit* instead of *Next*. Branches can
converge (several options point at the same `next`) or end early.

> Going back and changing an earlier answer truncates everything downstream — the
> branch may have changed, so stale answers are dropped.

## Reopening across messages

The `id` is a block-bus key. A later `suggestions` pill of kind `signal` can target
that id with `name: "open"` (and `payload: { "fresh": true }` to restart) to reopen
the drawer from a different message — no direct coupling between the two blocks.

## Live example

```bank:wizard
{
  "id": "needsWizardDocs",
  "title": "Find the right savings plan",
  "subtitle": "Three quick questions",
  "start": "goal",
  "questions": {
    "goal": {
      "title": "What are you saving for?",
      "options": [
        { "value": "emergency", "label": "Emergency fund", "next": "risk" },
        { "value": "retirement", "label": "Retirement", "next": "risk" }
      ]
    },
    "risk": {
      "title": "How do you feel about ups and downs?",
      "options": [
        { "value": "low", "label": "Keep it steady" },
        { "value": "high", "label": "I can ride out the dips" }
      ]
    }
  }
}
```
