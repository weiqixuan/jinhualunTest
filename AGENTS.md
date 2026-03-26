# Project Guidance

This file applies only to `D:\wqxCode\wqx_code\jinhualunCode`.

## Requirement-first workflow

- Treat the provided interview PDF as the primary requirements source.
- Before implementation, read `PRD.md` first and use it as the project requirement baseline.
- Then read `RULES.md` and treat it as the project execution constraint set derived from the PRD.
- If `PRD.md` and `RULES.md` conflict, follow `PRD.md` and record the discrepancy explicitly.
- Before scaffolding or coding, extract and restate:
  - project goal
  - required deliverables
  - explicit constraints
  - acceptance criteria
  - open questions and assumptions
- Do not skip directly to implementation when the requirement summary is still incomplete.

## Traceability

Maintain a clear chain from requirement to plan to implementation:

1. Requirement item
2. Planned module or task
3. Implementation artifact
4. Verification step

If any link is missing, call it out before proceeding.

## Planning output

Before implementation, the planning output should include:

- requirement summary
- deliverables
- constraints
- risks
- milestones
- task mapping

## Context files

The project-level context source lives under `docs/context/`.

Before starting any new task or resuming work in a new conversation, read at least:

- `docs/context/CURRENT_STATE.md`
- `docs/context/HANDOFF.md`
- `docs/context/DECISIONS.md`
- `docs/context/TASK_BOARD.md`

When relevant, also read:

- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

Treat these files as the compressed project memory for ongoing development.

Use the files with the following responsibilities and precedence:

- `CURRENT_STATE.md`: primary source for current goal, current status, next step, key files, and active risks
- `TASK_BOARD.md`: primary source for task status (`Done`, `Doing`, `Todo`, `Blocked`)
- `DECISIONS.md`: primary source for active technical and product decisions
- `HANDOFF.md`: short restart instructions derived from the current state and task board
- `WORKLOG.md`: append-only historical record that supports, but does not override, the current state files
- `REVIEW_LOG.md`: primary source for independent review outcomes

If these files diverge, reconcile them before closing the task. Prefer `CURRENT_STATE.md` for current status, `TASK_BOARD.md` for task state, and treat `WORKLOG.md` as historical evidence rather than the latest source of truth.

## Module implementation gate

Before implementing any module or feature, do not write code immediately.

Phase 1 must be completed first, and then wait for user confirmation:

- list all related modules
- list all related entities
- output a Mermaid sequence diagram for the main flow
- output a Mermaid data-flow diagram for the module
- label the input and output of each module
- recommend the technical stack for that module and explain why

After the user confirms Phase 1, complete Phase 2 and then wait for user confirmation again:

- explain the implementation plan step by step
- list which files will be created or modified in each step
- state which existing modules will be affected
- state key risks, compatibility concerns, and verification approach

Only after the user confirms Phase 2 may coding begin.

## Post-implementation review

After completing code changes, always run an additional code review pass with another agent before the final response.

That review must focus on:

- correctness risks
- regression risks
- security or safety issues
- missing edge-case handling
- missing or weak verification

If the reviewer finds issues, address or explicitly report them before closing the task.

## Context maintenance

After each non-trivial task, update the compressed context files instead of relying on chat history alone.

Minimum update requirements:

- `docs/context/CURRENT_STATE.md`: current goal, current progress, next step, key files, risks
- `docs/context/WORKLOG.md`: what changed, what was verified, what remains open
- `docs/context/TASK_BOARD.md`: task status changes
- `docs/context/HANDOFF.md`: short restart instructions for the next conversation

If a technical or product decision changed, also update:

- `docs/context/DECISIONS.md`

If code was implemented and reviewed, also update:

- `docs/context/REVIEW_LOG.md`

## Assumptions

- When the PDF leaves a point ambiguous, make the smallest reasonable assumption.
- Record each assumption explicitly so it can be revised later without hidden drift.
