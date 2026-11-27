# AI-assisted setup

Let your coding agent (Claude Code, Cursor, Codex, GitHub Copilot, OpenCode, …) do the setup.
It reads your Payload config and frontend, makes the changes from
[Getting started](/guide/getting-started), and checks the result.

## Option 1: install the skills, then ask

Install the [agent skills](./skills) into your project:

```sh
npx skills add derweili/payload-visual-editing
```

Then ask your agent:

```txt
Set up Payload visual editing in this project.
```

The `payload-visual-editing-setup` skill guides the setup. The `payload-visual-editing` skill stays
in the project afterwards, so the agent keeps following the rules (stegaClean, Draft Mode only, no
caching of encoded reads) in later work.

## Option 2: paste a prompt

No install needed. Copy this prompt into your agent:

```md
Set up Payload visual editing (@derweili/payload-visual-editing) in this project.

Follow the setup instructions in
https://raw.githubusercontent.com/derweili/payload-visual-editing/main/skills/payload-visual-editing-setup/SKILL.md
and apply the rules in
https://raw.githubusercontent.com/derweili/payload-visual-editing/main/skills/payload-visual-editing/SKILL.md

Before changing anything, read package.json, the Payload config and the frontend's data fetching,
and tell me which collections and globals you will enable and which text fields you will exclude.
When done, run the type check and build, and list what you changed and what you could not verify.
```

::: tip Agents without web access
If your agent can't fetch URLs, install the skills with `npx skills add` (option 1), or paste the
contents of the two `SKILL.md` files instead of the links.
:::

## Option 3: one-off, without installing

Run a skill once without adding it to the project:

```sh
npx skills use derweili/payload-visual-editing@payload-visual-editing-setup --agent claude-code
```

Omit `--agent` to print the prompt and paste it into any agent.

## Review the result

An agent can get the setup working and still miss a string that feeds logic. Check these yourself:

- [ ] Encoding is only requested in Draft Mode, and no encoded read is cached.
- [ ] `generateMetadata` / `<title>` / JSON-LD use `stegaClean`.
- [ ] Text fields used in comparisons, URLs or class names are in `sourceMaps.exclude` or cleaned.
- [ ] Production HTML has no zero-width characters
      (see [Caching and production safety](/guide/caching#check-your-published-pages)).
