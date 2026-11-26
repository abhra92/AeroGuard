<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working Guidelines (adapted from Karpathy's LLM coding guidelines)

These bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think before coding
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them rather than picking one silently.
- If a simpler approach exists, say so and push back when warranted.
- If something is unclear, stop, name what is confusing, and ask.

### 2. Simplicity first
- Write the minimum code that solves the problem. No speculative features.
- No abstractions for single-use code.
- No configurability or error handling for scenarios that cannot happen.
- If code could be half its length, rewrite it.

### 3. Surgical changes
- Touch only what the request requires. Do not "improve" adjacent code, comments, or formatting.
- Do not refactor code that is not broken.
- Match existing style, even where you would do it differently.
- If you spot unrelated dead code, mention it; do not delete it.
- Remove imports, variables, and functions that your own changes orphaned. Leave pre-existing dead code alone unless asked.
- Every changed line should trace directly to the user's request.

### 4. Goal-driven execution
- Turn tasks into verifiable goals before starting:
  - "Add validation" → write tests for invalid inputs, then make them pass.
  - "Fix the bug" → write a test that reproduces it, then make it pass.
  - "Refactor X" → confirm tests pass before and after.
- For multi-step work, state a brief plan with a check per step:
  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  ```
- Strong success criteria let you loop independently; vague ones ("make it work") force constant clarification.
