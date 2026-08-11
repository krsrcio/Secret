# Project-wide Copilot Instructions

These rules apply to all coding work in this repository.

## Core behavior

- Inspect the existing repository before making architectural assumptions.
- Reuse existing patterns, components, utilities, dependencies, and conventions where reasonable.
- Prefer small, maintainable changes over unnecessary rewrites.
- Do not modify unrelated functionality.
- Do not introduce a new dependency when the existing stack can solve the problem cleanly.
- Never expose secrets, tokens, credentials, private keys, or environment values in client-side code.
- Preserve backward compatibility unless the requested change explicitly requires a breaking change.
- When requirements are ambiguous, infer the safest reasonable implementation from the existing codebase and state the assumption.

## Implementation workflow

For non-trivial tasks:

1. Inspect relevant files and project structure.
2. Identify the current implementation and dependencies.
3. Create a short implementation plan.
4. Implement the smallest coherent solution.
5. Run the relevant formatter, linter, type checker, tests, or build commands available in the repository.
6. Fix errors introduced by the change.
7. Verify the requested user flow.
8. Summarize files changed, decisions made, checks performed, and remaining limitations.

## Code quality

- Follow the project's existing language and framework conventions.
- Prefer clear names and straightforward control flow.
- Avoid premature abstraction.
- Keep UI logic, business logic, and data/API access separated where the current architecture supports it.
- Handle loading, success, empty, disabled, and error states when relevant.
- Validate external input at trust boundaries.
- Avoid silent failures; surface actionable errors.
- Remove debugging code before considering the task complete.

## UI/UX defaults

Unless the project defines different design rules:

- Maintain the existing visual language.
- Prefer clear hierarchy, readable typography, consistent spacing, and accessible interaction targets.
- Avoid decorative complexity that does not improve usability.
- Support responsive layouts when the project targets multiple screen sizes.
- Preserve keyboard, screen-reader, focus, and contrast usability where applicable.

## Completion standard

A task is not complete merely because code was generated. It is complete when the implementation is integrated into the existing project, relevant checks pass, the main user flow has been verified, and the result is summarized clearly.
