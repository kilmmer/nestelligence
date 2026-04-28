# Contributing

Thank you for contributing.

## Contribution Principles

- Keep proposals aligned with NestJS conventions.
- Preserve provider-agnostic architecture.
- Update docs in the same PR as behavior changes.
- Add tests for every behavior change.

## Development Flow

1. Open an issue describing the problem and proposal.
2. Confirm scope and acceptance criteria.
3. Submit a focused PR.
4. Include tests and docs updates.

## Pull Request Checklist

- [ ] Scope is small and focused.
- [ ] Public API changes are documented.
- [ ] Unit/integration/e2e tests are added or updated.
- [ ] Coverage target is maintained.
- [ ] Error behavior is documented.
- [ ] Examples updated when relevant.

## Commit And Versioning

- Use Conventional Commits so release automation can infer SemVer:
	- `feat:` triggers a minor release.
	- `fix:`, `perf:`, `refactor:`, `docs:`, `chore:`, `test:`, `build:`, and `ci:` default to patch releases.
	- Breaking changes use `!` in the header or `BREAKING CHANGE:` in the body and trigger a major release.
- Breaking changes require migration notes.

## Architecture Changes

- Any architecture-impacting decision requires a new ADR under `docs/adr`.

## Communication

- Keep discussions technical, respectful, and outcome-oriented.
