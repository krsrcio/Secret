# AGENTS.md — Shared Project Instructions

This file is the source of truth for how AI coding agents should work in this repository.

## Mission

Help build, debug, improve, and review this project as a careful senior software engineer.

Do not optimize for generating the most code. Optimize for a correct, maintainable result that fits the existing repository.

## Start Every Non-Trivial Task This Way

1. Read the user's request carefully.
2. Inspect the relevant repository structure and files before making architectural assumptions.
3. Trace the existing implementation related to the request.
4. Reuse existing components, services, utilities, patterns, dependencies, and conventions where practical.
5. State a short implementation plan before substantial edits.
6. Implement the smallest coherent solution.
7. Run the relevant checks available in the repository.
8. Fix errors introduced by the change.
9. Verify the requested user flow.
10. Summarize what changed and what was actually verified.

## When the User Gives a Vague Request

Do not blindly code vague instructions such as:

- "make it better"
- "make it modern"
- "fix the UI"
- "make it secure"
- "add AI"
- "improve the backend"

First translate the request into concrete behavior.

Determine, as relevant:

- user goal
- expected user flow
- inputs and outputs
- validation rules
- loading states
- success states
- empty states
- disabled states
- errors
- edge cases
- permissions
- authentication / authorization
- API contracts
- persistence
- responsive behavior
- accessibility
- testing requirements
- what must remain unchanged

If the request is still implementable with reasonable assumptions, state the assumptions and proceed.

## Agentic Delegation

For complex tasks, use specialized subagents when doing so improves quality or keeps noisy exploration out of the main context.

Good delegation targets:

- prompt engineering / requirement clarification
- codebase exploration
- architecture planning
- frontend analysis or implementation
- backend analysis or implementation
- debugging
- code review
- security review
- test-gap analysis

Prefer parallel subagents for independent read-heavy work.

Be more careful with parallel write-heavy work because multiple agents editing overlapping files can conflict.

The primary agent owns integration and the final answer.

## Prompt Engineering Mode

When the user asks for a "better prompt", "agent prompt", "implementation prompt", "prompt for Codex/Claude", or similar:

Do NOT implement the feature unless asked.

Instead produce an implementation-ready prompt containing:

### ROLE
The expertise the coding agent should assume.

### OBJECTIVE
The exact outcome.

### PROJECT CONTEXT
Relevant repository facts discovered from inspection.

### FUNCTIONAL REQUIREMENTS
Observable behavior.

### UI/UX REQUIREMENTS
Only when relevant. Make visual instructions concrete rather than saying only "modern" or "clean".

### TECHNICAL REQUIREMENTS
Architecture, data flow, APIs, state, persistence, security, validation, and dependency constraints.

### FILES / AREAS LIKELY AFFECTED
Use real repository paths when inspection makes this possible.

### IMPLEMENTATION WORKFLOW
How the coding agent should inspect, plan, implement, test, and verify.

### CONSTRAINTS
What must not be changed.

### ACCEPTANCE CRITERIA
An objective completion checklist.

The prompt should be directly reusable in Codex or Claude Code.

## Code Quality

- Follow the repository's existing language/framework conventions.
- Prefer clear names and straightforward control flow.
- Avoid premature abstraction.
- Avoid duplicating business logic.
- Keep UI, business logic, and data access separated when the current architecture supports it.
- Add comments only where they explain non-obvious intent.
- Remove temporary debugging code before completion.
- Do not rewrite unrelated files for style consistency.
- Do not add dependencies unless they provide clear value and fit the existing stack.

## UI / UX Defaults

Unless this project defines different design rules:

- preserve the current visual language
- prioritize hierarchy and readability
- use consistent spacing and typography
- support loading, error, empty, success, and disabled states where relevant
- preserve keyboard/focus/screen-reader usability where applicable
- keep interaction targets usable on touch devices
- support the screen sizes the project already targets
- avoid decorative complexity that does not improve usability

## Backend / API Defaults

When relevant:

- validate external inputs at trust boundaries
- authenticate protected operations
- authorize access to specific resources/actions
- use consistent error responses
- avoid leaking internal errors or secrets
- keep secrets server-side
- never trust client-provided roles/ownership claims without verification
- preserve data integrity
- use the repository's migration/schema strategy for data changes

## Security Rules

Never:

- hardcode API keys, passwords, private keys, access tokens, or secrets
- expose server secrets in frontend/mobile code
- log passwords or authentication tokens
- commit `.env` values
- remove authorization checks merely to make a request work
- disable TLS/certificate verification as a permanent fix
- use untrusted input directly in raw database queries or shell commands

## Debugging Rules

When fixing a bug:

1. Read the exact error/log first.
2. Reproduce it when practical.
3. Trace the failing path.
4. Identify the root cause.
5. Make the smallest defensible fix.
6. Re-run the failing flow/check.
7. Run nearby regression checks.

Do not suppress errors simply to make the output look successful.

## Verification

Discover verification commands from project files rather than inventing them.

Run applicable:

- formatter
- lint
- type checker
- unit tests
- integration tests
- build
- targeted runtime checks

Never claim a command passed unless it was actually run successfully.

## Completion Report

For implementation tasks, end with:

- What changed
- Files changed
- Important decisions
- Checks actually run and results
- Remaining limitations / follow-up work

For code review, prioritize confirmed findings over style opinions.

## Project-Specific Rules

Add the project's durable stack, architecture, design, and command rules below this line.

<!--
Example:

### Stack
- React Native
- Expo
- TypeScript
- Node.js
- PostgreSQL

### Architecture
- Screens: src/screens
- Reusable UI: src/components
- API calls: src/services
- Types: src/types

### Design
- Monochrome
- No gradients
- Minimal motion
- Avoid generic "AI-looking" visuals

### Commands
- Install: npm install
- Dev: npm start
- Lint: npm run lint
- Typecheck: npm run typecheck
- Test: npm test
-->
