# Claude Feature Reference

These notes are based on Anthropic documentation.

## Subagents

Claude Code supports custom subagents as Markdown files with YAML frontmatter. Subagents can have separate prompts, tool access, permissions, model choice, and skills.

Useful official docs:
- https://code.claude.com/docs/en/sub-agents

## Skills

Agent Skills are reusable filesystem-based resources with instructions, metadata, and optional resources/scripts.

Useful official docs:
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

## Model usage in this package

This package avoids Fable.

It uses:
- opus for complex reasoning, architecture, ML, security, and performance;
- sonnet for normal implementation;
- haiku for lightweight triage and documentation.
