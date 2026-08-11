# GitHub / VS Code Agentic Starter Kit

A reusable set of GitHub Copilot custom agents for software projects.

## Included

- **Orchestrator** — coordinates larger tasks and delegates to specialists.
- **Prompt Engineer** — converts rough ideas into implementation-ready requirements.
- **Architect** — designs repository-aware implementation plans and contracts.
- **Frontend** — implements UI, client state, navigation, accessibility, and API integration.
- **Backend** — implements APIs, auth, persistence, validation, and server logic.
- **Debugger** — isolates root causes and implements minimal fixes.
- **Reviewer** — performs read-focused final code review.
- **copilot-instructions.md** — common rules automatically applied across the repository.

## Install in a project

Copy the `.github` folder from this starter kit into the root of your repository.

Your project should look like:

```text
your-project/
├── .github/
│   ├── copilot-instructions.md
│   └── agents/
│       ├── orchestrator.agent.md
│       ├── prompt-engineer.agent.md
│       ├── architect.agent.md
│       ├── frontend.agent.md
│       ├── backend.agent.md
│       ├── debugger.agent.md
│       └── reviewer.agent.md
├── src/
├── package.json
└── ...
```

Open the repository in a recent version of VS Code with GitHub Copilot enabled. The workspace custom agents should appear in the Copilot Chat agents dropdown.

## Recommended usage

### Most feature requests

Select **Orchestrator** and write naturally:

```text
Add forgot-password support to this project. Keep the current design and architecture.
```

The agent should inspect the repository, plan the work, use specialized agents when useful, implement, verify, and review.

### Turn a rough idea into a better coding prompt

Select **Prompt Engineer**:

```text
I want the dashboard to feel cleaner and work better on mobile.
```

It will inspect the project and turn the request into concrete requirements.

### Plan before coding

Select **Architect**:

```text
Plan how to add role-based access control without changing the current auth provider.
```

### Frontend-only work

Select **Frontend**:

```text
Implement the profile-editing screen described above.
```

### Backend-only work

Select **Backend**:

```text
Add the API and validation required for profile editing.
```

### Errors

Select **Debugger** and provide the error plus what you expected:

```text
The app crashes after login. Find the root cause and fix it.
```

### Before finishing

Select **Reviewer**:

```text
Review the current changes before I commit them.
```

## Reuse across every project

There are two useful options.

### Option A — Commit the agents into every repository

Copy `.github/` to each project.

Best when:
- the project is shared with other developers
- you want the agent rules version-controlled
- you may customize agents for each repository

### Option B — Install agents at user level

VS Code also supports user-level agents under:

```text
~/.copilot/agents/
```

This makes an agent available across workspaces.

Project-specific rules should generally remain inside each repository's `.github/copilot-instructions.md`.

## Customize per project

Keep the generic agents mostly unchanged.

Put project-specific rules in `.github/copilot-instructions.md`, for example:

```md
## Project stack

- React Native
- Expo
- TypeScript
- Node.js API
- PostgreSQL

## Design rules

- Monochrome UI
- No gradients
- Avoid decorative AI/robot imagery
- Prefer simple native-feeling interactions

## Architecture rules

- API calls live in `src/services`
- Shared UI lives in `src/components`
- Never call the database directly from the mobile client
```

That keeps the agents reusable while giving them the right context for each repository.

## Notes

Custom-agent capabilities vary by Copilot environment. VS Code supports workspace agents and handoffs. GitHub Copilot cloud agent also supports repository custom agents, while some VS Code-specific frontmatter such as handoffs may be ignored by the cloud environment.

Review AI-generated changes before committing or deploying them.
