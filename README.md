# Codex + Claude Code Agentic Starter

Reusable project instructions and specialist subagents for people who use both OpenAI Codex and Claude Code.

## What this solves

Instead of writing a perfect prompt every time, put durable behavior in the repository once.

Then you can ask:

```text
Make the resume upload flow better.
```

or:

```text
Use the prompt engineer and turn this into a proper implementation prompt first.
```

Both Codex and Claude Code get project rules plus specialist agents.

## Structure

```text
your-project/
├── AGENTS.md
├── CLAUDE.md
├── PROMPTS.md
│
├── .codex/
│   └── agents/
│       ├── prompt-engineer.toml
│       ├── architect.toml
│       ├── frontend.toml
│       ├── backend.toml
│       ├── debugger.toml
│       └── reviewer.toml
│
└── .claude/
    └── agents/
        ├── prompt-engineer.md
        ├── architect.md
        ├── frontend.md
        ├── backend.md
        ├── debugger.md
        └── reviewer.md
```

## Install

Extract/copy the contents of this starter folder into the ROOT of your Git repository.

Do not put the whole `codex-claude-agentic-starter` directory inside your source directory. Its `AGENTS.md`, `CLAUDE.md`, `.codex`, and `.claude` should sit at the repository root.

## Customize Each Project

Edit the **Project-Specific Rules** section at the bottom of `AGENTS.md`.

Example:

```md
## Project-Specific Rules

### Stack
- React Native
- Expo
- TypeScript
- Express
- PostgreSQL

### Architecture
- Screens: src/screens
- Components: src/components
- API access: src/services
- Shared types: src/types

### Design
- Monochrome
- No gradients
- No glow effects
- Avoid generic AI/robot imagery
- Prefer simple, native-feeling interactions

### Commands
- Install: npm install
- Dev: npx expo start
- Lint: npm run lint
- Typecheck: npx tsc --noEmit
- Test: npm test
```

Keep project-specific facts there rather than changing every specialist agent.

## The Main Workflow

### Rough idea

```text
"I want users to upload a resume and compare it with a job."
```

### Step 1 — Prompt engineer

Ask Codex:

```text
Delegate to the prompt_engineer agent and turn this idea into a proper implementation prompt. Do not implement yet.
```

Or Claude:

```text
@agent-prompt-engineer Turn this idea into a proper implementation prompt. Do not implement yet.
```

### Step 2 — Build

Paste/continue with:

```text
Implement this specification. Inspect the repository first, use specialist agents where useful, run checks, and review the completed changes.
```

### Step 3 — Review

Ask the reviewer agent before commit.

See `PROMPTS.md` for copy/paste commands.

## Optional Global Setup

If you want personal agents available even in repositories without this starter:

### Codex
Copy compatible agent TOML files to:

```text
~/.codex/agents/
```

You can also keep personal defaults in:

```text
~/.codex/AGENTS.md
```

### Claude Code
Copy agent Markdown files to:

```text
~/.claude/agents/
```

Keep repository-specific project rules inside the repository rather than only in global configuration.

## Recommended Habit

Do not make the AI rewrite your full project on every request.

Use this loop:

```text
Idea
  ↓
Prompt Engineer (when the request is vague)
  ↓
Architect (when the change is structural)
  ↓
Frontend / Backend implementation
  ↓
Debugger (only if needed)
  ↓
Reviewer
  ↓
You inspect the diff and commit
```

For small changes, skip unnecessary agents and let the primary coding agent implement directly.

## Important

AI-generated code still requires your review. Agentic workflows improve structure and delegation; they do not make generated changes automatically correct.
