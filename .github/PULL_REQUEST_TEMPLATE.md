## What changed

<!-- A short summary of the change. -->

## Why

<!-- The problem this solves, or the reason for the change. Link the design decision if there was one. -->

## Related issue

<!-- Use "Fixes #123" to close an issue when this PR merges, or "Refs #123" if it is related. -->

Fixes #

## How it was tested

<!-- Steps a reviewer can follow, and the results you saw. For design modules, say which module and inputs you used. -->

## Screenshots or recordings

<!-- Required for UI, 3D CAD viewer, or report layout changes: before and after. Delete this section otherwise. -->

## Checklist

- [ ] Frontend lint passes: `cd frontend && npm run lint`
- [ ] Frontend build passes: `cd frontend && npm run build`
- [ ] Backend tests pass (see CONTRIBUTING.md), or the change has no backend impact
- [ ] Python changes pass `ruff check backend`, or the findings are explained below
- [ ] Documentation is updated in `documentation/` where behaviour, setup, or APIs changed
- [ ] No secrets, `.env` files, or real credentials are included in the diff or screenshots
- [ ] The PR targets `25april` and contains focused commits

## Notes for reviewers

<!-- Anything that needs special attention, follow-up work, or known limitations. -->
