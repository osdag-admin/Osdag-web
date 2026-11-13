# Branch Preview Server — Plan

**Date:** 2026-10-25 | **Scope:** a dashboard on the staging server that deploys any fork + branch of Osdag-web as its own preview | **Status:** Proposed — nothing implemented yet

## Summary

Contributors work in forks of `osdag-admin/Osdag-web` and open PRs from there. Today the only way to see a branch running is on a developer's own machine, so managers and reviewers can't try a change before it's merged.

This plan adds a small web dashboard on the **staging server** (separate from production). From it, an allowed user picks a fork and branch and clicks Deploy. The server builds that branch and runs it as an isolated preview with its own containers, database and public URL. Previews stop themselves when idle and are deleted when stale, so a modest server can serve the whole team.

Expected use: 4–5 developers and managers at a time, growing to about 10.

## Decisions so far

| Question | Decision |
|---|---|
| Where it runs | The staging server, a separate machine from production. Previews never touch production data or secrets. |
| Who can use it | People on an allowlist of GitHub usernames, signing in with GitHub. Contributors have no write access to `osdag-admin`, so repo permissions can't be used. |
| Which code | Any **fork + branch**, plus automatic previews for open PRs against `osdag-admin/Osdag-web` by allowlisted authors. |
| Public URL | One Cloudflare quick tunnel per preview (random `trycloudflare.com` address), shown in the dashboard. No domain needed. |
| How it learns about PRs and commits | Polls the public GitHub API every 1–2 minutes. A webhook would be instant, but only an `osdag-admin` admin can install one, and GitHub needs a fixed address to call, which the quick tunnel doesn't provide. The 1–2 minute delay is small next to a 2–3 minute build. |
| How it's built | The staging server clones and builds each branch itself. CI on fork PRs can't push images to our registry, so pulling ready-made images isn't an option for forks. |

## Why not use IRIS-NITK/Staging-Server directly

[IRIS-NITK/Staging-Server](https://github.com/IRIS-NITK/Staging-Server) is the inspiration for the dashboard (deploy buttons, live logs, async deploys, cleanup), but it runs **one container per deployment** with `docker run`, assumes their GitLab server for sign-in and cloning, and routes by subdomain. An Osdag preview needs several services (frontend, backend, Celery, Postgres, Redis), we're on GitHub, and we have no domain. Adapting it would mean rewriting its core, so we build a small purpose-made dashboard and borrow its ideas.

## How a preview works

```
Dashboard (Django + Celery, on staging server)
   │  user picks fork + branch → Deploy
   ▼
1. git clone/fetch the fork branch into a per-preview folder
2. docker build backend + frontend   (shared layer cache: only code layers rebuild)
3. create Postgres database + user   osdag_pv_<id>   (on the shared staging Postgres)
4. docker compose -p osdag-pv-<id> up   using a preview compose template:
       frontend (nginx)   backend (1 gunicorn worker)   celery (1 worker, all queues)   cloudflared (quick tunnel)
5. read the tunnel URL from cloudflared's log, store it, show it in the dashboard
```

- **Shared services:** one Postgres server and one Redis on the staging server. Each preview gets its own database and Postgres user, and its own Redis database number, so Celery tasks from one preview can never reach another's workers.
- **No seed data needed:** sign-in is Firebase and the steel catalog ships in `osdag_core`'s SQLite, so a fresh database only needs `migrate`.
- **Build time:** the conda/pythonocc layer is rebuilt only when `requirements.txt` or the Dockerfile changes. A typical code-only change should rebuild in about 2–3 minutes (to be measured in phase 1).

## Lifecycle and limits

| State | Meaning |
|---|---|
| Building | Clone and image build in progress (live build log in the dashboard) |
| Running | Containers up, URL live |
| Stopped | Containers stopped, database kept. "Start" brings it back in about 30 s |
| Failed | Build or start failed; log kept for debugging |
| Deleted | Containers, images, database and folder removed |

- **Auto-stop:** a running preview with no visits for 3 hours stops (visits measured from the preview's nginx access log).
- **Auto-delete:** a preview unused for 7 days, or whose PR has closed, is deleted.
- **Running limit:** at most 4 previews running at once (configurable). Starting a fifth asks which one to stop.
- **Pinned preview:** `osdag-admin/Osdag-web` : `25april` runs permanently and redeploys on every new commit, as a shared staging copy of the main branch.

## Dashboard

- **Previews list:** fork, branch, commit, who deployed it, status, URL, memory use, last visit.
- **Actions:** Deploy, Redeploy latest commit, Start/Stop, Reset database, Delete.
- **Logs:** live build log, and live logs per container (frontend, backend, celery).
- **Open PRs:** PRs against `osdag-admin/Osdag-web`, with a Deploy button; allowlisted authors' PRs deploy automatically.
- **Activity:** who did what and when.
- **Admin:** manage the allowlist, the running limit and the idle timeouts.

## Security

Preview code comes from forks, so it is treated as untrusted even though the people deploying it are trusted:

- Preview containers get **no Docker socket** and **no secrets** of the dashboard (GitHub OAuth secret, its database password).
- Each preview's Postgres user can reach **only its own database**.
- Each preview runs on **its own Docker network**, joined only to the shared Postgres and Redis.
- **Memory and CPU limits** per preview (e.g. 2 GB, 2 CPUs), so one preview can't starve the server.
- Only allowlisted users can deploy. A PR from someone not on the allowlist appears in the list but deploys only when an allowlisted user clicks Deploy.
- The dashboard itself controls Docker through the socket, so it is reachable only through GitHub sign-in.

## Server sizing (staging)

Measured: one Osdag worker process uses about 280–300 MB with Django, `osdag_core` and OpenCascade loaded.

| Item | Memory |
|---|---|
| 4 running previews × ~1.5 GB | ~6 GB |
| Shared Postgres + Redis | ~0.5–1 GB |
| Dashboard (Django + Celery) | ~0.5 GB |
| Headroom for one image build at a time | ~2–3 GB |
| **Total** | **~10–11 GB** |

Recommended: **16 GB RAM, 8 cores, 100 GB+ disk** (images and build cache; old images pruned nightly). With 10 developers, the auto-stop rule is what keeps this enough; raise the running limit only with more RAM.

## Phases

1. **Scripted preview (~3 days).** Compose template, database/user/Redis setup, build with shared cache, tunnel URL capture, delete. Driven from the command line. Measure real build time and memory.
2. **Dashboard (~4 days).** Django app with GitHub sign-in and allowlist, preview list, Deploy/Redeploy/Start/Stop/Delete, Celery jobs for the slow steps, live build log.
3. **Lifecycle (~2 days).** Container logs, auto-stop and start, running limit, auto-delete, nightly image prune, activity history.
4. **GitHub integration (~2 days).** List open PRs against `osdag-admin/Osdag-web`, auto-deploy for allowlisted authors, delete on PR close, pinned `25april` preview.

About 2–2.5 weeks of focused work in total.

## Out of scope

- Production deploys (stay with the existing CD workflow).
- Copying production data into previews.
- Custom domains per preview (possible later with a named Cloudflare tunnel and a domain).
- Scaling a single preview beyond one worker.

## Open questions

- Staging server specs (RAM, cores, disk), to confirm the running limit.
- Where the dashboard's code lives: its own repository, or `tools/preview-server/` in this one.
- Should non-developers (managers) be able to deploy, or only start and stop existing previews?
