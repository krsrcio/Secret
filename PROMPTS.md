# Reusable Prompts

You do not need to write long prompts once this starter kit is installed. Use short task-oriented instructions.

## Better Prompt Only

### Codex

```text
Delegate to the prompt_engineer agent.

Turn this rough idea into an implementation-ready prompt for this repository.
Inspect the project first when useful. Do not implement yet.

IDEA:
<your rough idea>
```

### Claude Code

```text
@agent-prompt-engineer

Turn this rough idea into an implementation-ready prompt for this repository.
Inspect the project first when useful. Do not implement yet.

IDEA:
<your rough idea>
```

## Build a Feature

```text
Build this feature using the existing project architecture:

<describe the feature>

Inspect the repository first.
For substantial work, delegate independent analysis to the appropriate specialist agents.
Create a short plan, implement, run relevant checks, fix implementation-caused failures, then review the result.
Do not change unrelated functionality.
```

## Build From an Improved Prompt

```text
Implement the specification below.

First inspect the repository and reconcile the specification with the current code.
Preserve existing architecture unless the specification requires a change.
Use specialized agents when useful.
Run relevant verification and review the completed changes.

SPECIFICATION:
<paste prompt here>
```

## Debug

### Codex

```text
Delegate to the debugger agent.

Find the root cause and fix this issue with the smallest safe change.

EXPECTED:
<expected behavior>

ACTUAL:
<actual behavior>

ERROR / LOG:
<paste error>
```

### Claude Code

```text
@agent-debugger

Find the root cause and fix this issue with the smallest safe change.

EXPECTED:
<expected behavior>

ACTUAL:
<actual behavior>

ERROR / LOG:
<paste error>
```

## Review Before Commit

### Codex

```text
Delegate to the reviewer agent to review the current changes.
Prioritize correctness, security, regressions, and missing tests.
Do not edit files during the review.
```

### Claude Code

```text
@agent-reviewer

Review the current changes.
Prioritize correctness, security, regressions, and missing tests.
Do not edit files during the review.
```

## Architecture First

### Codex

```text
Delegate to the architect agent.

Design the implementation for:
<feature>

Inspect the repository.
Do not edit code.
Return the affected areas, data flow, API contract if relevant, implementation order, risks, and verification plan.
```

### Claude Code

```text
@agent-architect

Design the implementation for:
<feature>

Inspect the repository.
Do not edit code.
Return the affected areas, data flow, API contract if relevant, implementation order, risks, and verification plan.
```
