# Agent skills

This repository ships [agent skills](https://agentskills.io): instructions that teach coding agents
how to set up the packages and what to watch out for when working with them. They work with Claude
Code, Cursor, Codex, OpenCode, GitHub Copilot and [many more](https://skills.sh).

## Install

Run this from your project:

```sh
npx skills add derweili/payload-visual-editing
```

The CLI asks which skills to install and for which agents. Skills are installed into the current
project by default; add `-g` to make them available in every project.

Install a single skill for a single agent:

```sh
npx skills add derweili/payload-visual-editing --skill payload-visual-editing -a claude-code
```

Keep them up to date:

```sh
npx skills check
npx skills update
```

::: tip Commit the skills
Commit the installed skills (and `skills-lock.json`) so everyone on the team, and every agent
running in CI, gets the same rules.
:::

## Included skills

| Skill | Use it for |
| --- | --- |
| `payload-visual-editing-setup` | Adding visual editing to a Payload 3 + Next.js project: install, plugin config, Draft Mode route, encoded reads, overlay, verification |
| `payload-visual-editing` | Day-to-day work in a project that uses it: `stegaClean` rules, Draft-Mode-only encoding, no caching of encoded reads, `fieldAttrs` / `sourceOf` for images and numbers, troubleshooting |

The source is in the repository's
[`skills/`](https://github.com/derweili/payload-visual-editing/tree/main/skills) folder.

## What the agent learns

- Strings from Payload are **not** what they look like in Draft Mode. Comparisons, URLs, metadata,
  form values and parsing need `stegaClean`, or the field belongs in `sourceMaps.exclude`.
- Encoding is requested only in Draft Mode, and encoded reads never enter a cache.
- Images, numbers, selects and dates need `fieldAttrs(sourceOf(...))` /
  `fieldAttrs(fieldSourceOf(...))`, and source tags don't survive serialization to client
  components.
- Which entry point to import from in server components (`/vanilla`) vs. the overlay mount
  (`/react`).
- What to update when a collection, global or field is added.

## Without the skills CLI

The skills are plain Markdown. Point your agent at the raw files, or copy them into its rules
directory (e.g. `.claude/skills/`, `.cursor/rules/`, `AGENTS.md`):

- [`skills/payload-visual-editing-setup/SKILL.md`](https://raw.githubusercontent.com/derweili/payload-visual-editing/main/skills/payload-visual-editing-setup/SKILL.md)
- [`skills/payload-visual-editing/SKILL.md`](https://raw.githubusercontent.com/derweili/payload-visual-editing/main/skills/payload-visual-editing/SKILL.md)
