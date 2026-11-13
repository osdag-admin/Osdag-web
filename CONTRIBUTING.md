# Contributing to Osdag-Web

Thanks for helping improve Osdag-Web. This guide covers how to get the project running, the checks that CI runs, and how to send a change for review. For architecture details, start with [documentation/INDEX.md](documentation/INDEX.md).

## Workflow

1. **Fork** [osdag-admin/Osdag-web](https://github.com/osdag-admin/Osdag-web) on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/<your-username>/Osdag-web.git
   cd Osdag-web
   git remote add upstream https://github.com/osdag-admin/Osdag-web.git
   ```

2. **Branch from `25april`**, the default branch. Keep it up to date with upstream:

   ```bash
   git fetch upstream
   git checkout -b <short-topic-name> upstream/25april
   ```

3. **Make focused changes.** One logical change per PR is easier to review. For large changes (new modules, refactors), open an issue first so the approach can be agreed on.

4. **Push** the branch to your fork and **open a pull request against `25april`** in `osdag-admin/Osdag-web`. The PR template will guide the description.

Keep your branch current by rebasing onto `upstream/25april` before review, or merge it if you prefer; avoid force-pushing once a reviewer has started looking at the PR.

## Local setup

Setup is documented in one place. Use the one that matches your machine:

- **Docker Compose** (recommended): see [README.md](README.md#option-a-using-docker-compose-recommended) and [documentation/general/installation_docs_linux.md](documentation/general/installation_docs_linux.md) (also `installation_docs_mac.md` and `installation_docs_windows.md`).
- **Native development**: see the "Native Local Development" section of [README.md](README.md) and the setup scripts at the repository root: `setup_ubuntu.sh`, `setup_arch.sh`, `setup_mac.sh`, and `setup_windows.ps1`.

Before running either, create a `.env` file from the template and fill in real values:

```bash
cp .env.example .env
```

`.env` is git-ignored and must never be committed. The Firebase service account file (`backend/firebase-service-account.json`) is also required; see the Firebase section of the README.

## Checks

These are the same checks that the CI workflow in `.github/workflows/ci.yml` runs. Run them locally before opening a PR.

**Frontend** (Node 22, see `engines` in `frontend/package.json`):

```bash
cd frontend
npm ci
npm run lint
npm run build
```

**Backend tests** (pytest with pytest-django, using the `config.settings` module). CI runs them against Postgres and Redis from Docker Compose:

```bash
docker compose up -d db redis
cd backend
python -m pytest --ds=config.settings
```

Use the database settings from `.env` (or the values shown in `.github/workflows/ci.yml`). On a Linux machine without a display, prefix the pytest command with `xvfb-run`, as CI does.

**Python lint** (Ruff, configured in `pyproject.toml` and scoped to `backend/`):

```bash
pip install ruff==0.17.2
ruff check backend --select E9,F63,F7,F82   # must pass: CI fails on these (syntax errors, undefined names)
ruff check backend                          # full rule set: old code still has findings; don't add new ones
```

**Pre-commit hooks** (optional, but they catch most problems before a push): run ruff, gitleaks, and basic file checks on each commit.

```bash
pip install pre-commit
pre-commit install
```

## Commit messages

- Use an imperative subject line: "Add cover plate weld check", not "Added" or "Adds". Keep it under about 72 characters.
- Separate the subject from the body with a blank line. In the body, explain *why* the change is needed when that is not obvious from the diff.
- Reference the issue at the end of the message: `Fixes #123` closes it on merge, and `Refs #123` links it without closing.

## Documentation

- Developer documentation lives in [documentation/](documentation/). Start with [documentation/INDEX.md](documentation/INDEX.md) for architecture, the `.osi` format, the form engine, and CAD visualization.
- Installation guides live in [documentation/general/](documentation/general/).
- Update the relevant chapter when you change behaviour, setup steps, or an API. The PR checklist asks for this.

## Reporting bugs and requesting features

Use the issue forms. They ask for the information that makes a report reproducible:

- **Bug report**: the module, steps to reproduce, the `.osi` inputs, the expected value (Osdag Desktop) and the actual value (Osdag Web), your browser and OS, and screenshots if relevant.
- **Feature request**: the problem, the proposed solution, and the area of the app it affects.

Search existing issues first. Do not attach files that contain passwords, API keys, or private project data.

## Security

Do not report security vulnerabilities in a public issue. Contact the maintainers privately instead, and never commit credentials. If you find a credential in the repository, report it right away so it can be rotated.
