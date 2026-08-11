# Claude Code Project Instructions

@AGENTS.md

## Claude-Specific Delegation

Use project subagents in `.claude/agents/` when their specialty matches the task.

For substantial features, keep the main conversation focused on requirements and integration. Delegate noisy exploration, focused implementation analysis, debugging, and review when useful.

When I explicitly name or @-mention a project subagent, use it for that task.

For a vague feature request where I want a better prompt, use the `prompt-engineer` subagent first and return the improved prompt before implementation unless I explicitly asked you to build immediately.

For a substantial completed implementation, use the `reviewer` subagent before finalizing when practical.

Do not delegate tiny tasks just to appear agentic.
