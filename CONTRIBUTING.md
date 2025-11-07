# Contributing to Divergent Flow CLI

Thanks for your interest in contributing!

## Development Setup

- Node.js >= 18
- Install deps: `npm ci`
- Run tests: `npm test`
- Build: `npm run build`
- Dev (watch): `npm run dev`

## Commit Style

This project uses Conventional Commits. Examples:

- `feat: add capture export command`
- `fix: handle missing config file`
- `docs: update README install instructions`

## Pull Requests

1. Fork and create a feature branch.
2. Write tests for new behavior.
3. Ensure `npm test` passes and `npm run build` succeeds.
4. Open a PR with a clear description of the change and rationale.

## Release Automation

Releases are automated via Release Please. Merge PRs using conventional commit messages; the bot will propose version bumps and changelogs.

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
