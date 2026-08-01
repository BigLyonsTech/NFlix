# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A full-stack Netflix clone (school/portfolio project): Spring Boot 3 + MongoDB backend,
React 19 + Vite frontend. Two independent projects in one repo, no root package.json —
always `cd backend` or `cd frontend` before running tooling.

```
netflix-clone/
├── backend/    Spring Boot API (Java, Maven) — see backend/src/main/java/com/lyon/netflixclone
├── frontend/   React + TypeScript + Vite + Tailwind v4
├── docker-compose.yml   Runs mongodb + backend (frontend is NOT in compose — run it locally)
└── .env.example         JWT_SECRET / OPENAI_API_KEY / OPENAI_MODEL for docker-compose
```

## Build / run / test commands

Backend (from `backend/`):
```
mvn -q -DskipTests compile   # fast compile check
mvn test                      # full test suite (27 tests, all pass)
mvn spring-boot:run           # run locally, needs Mongo on localhost:27017 or $MONGODB_URI
mvn package                   # produces target/netflix-clone-*.jar; java -jar it to run
```

Frontend (from `frontend/`):
```
npm install
npm run lint     # tsc --noEmit — there is no eslint config, this IS the lint script
npm run build    # vite build -> dist/
npm run dev      # vite dev server on :3000
```

Full stack: `docker compose up --build` from repo root runs Mongo + backend
(backend on :8080, Mongo on :27017) — verified working end-to-end (container
build, boot, `/api/content`, `/api/auth/signup` all confirmed). The frontend is
**not** containerized — run `npm run dev` separately against it. Docker Desktop
must actually be running before `docker compose up`; on this Windows machine it
is not started by default (`Start-Process "C:\Program Files\Docker\Docker\Docker
Desktop.exe"` and wait ~30-60s for the daemon before `docker compose` will
connect).

Seeded admin login (auto-created by `DataSeeder` on first backend boot):
`admin@netflixclone.com` / `Admin123!`.

CI: `.github/workflows/ci.yml` runs `mvn test` + `mvn package` (backend) and
`npm run lint` + `npm run build` (frontend) on every push/PR, as two parallel
jobs on `ubuntu-latest`. It assumes **`netflix-clone/` is the git repo root**
(job `working-directory` is `backend`/`frontend`, not `netflix-clone/backend`).
This repo had no `.git` and no `git` CLI installed as of 2026-07-30, so the
workflow had never run — **fixed 2026-08-01**: repo is now on GitHub at
`github.com/BigLyonsTech/NFlix`, and the first CI run on `main` passed (both
jobs green). If you restructure the repo root, update the `working-directory`
values accordingly.

## Known issues (verified 2026-07-30, resolved same day)

- **Fixed:** the backend used to fail to package or run via Maven at all —
  `mvn spring-boot:run` and `mvn package` both threw `Unsupported class file major
  version 69` at the `spring-boot-maven-plugin` step, and `AuthFlowIntegrationTest`
  (the one `@SpringBootTest` in the suite) failed with `Unable to find a
  @SpringBootConfiguration`. Root cause: an automated modernization tool bumped this
  repo's Java target 21 → 25 on 2026-07-26 (see `.github/modernize/java-upgrade/`)
  but left `spring-boot-starter-parent` pinned at **3.3.4** (Sept 2024), which
  predates Java 25 (Sept 2025) and ships an ASM version that can't parse Java 25
  class files — breaking every place Boot tooling reads compiled `.class` files with
  ASM (the maven-plugin's run/repackage goals, and Spring's `@SpringBootConfiguration`
  classpath scan). **Fixed by bumping `spring-boot-starter-parent` to `3.5.16`** in
  `backend/pom.xml`. Verified after the bump: `mvn package` produces a working jar,
  `java -jar target/netflix-clone-*.jar` boots against local MongoDB and serves
  `/api/content` and `/api/auth/signup` correctly, and `mvn test` passes all 19
  tests including `AuthFlowIntegrationTest`. If you ever see "Unsupported class file
  major version" again after touching `java.version` or the Spring Boot version,
  this is the mismatch to check first.
- `backend/target/` can accumulate `hs_err_pid*.log` / `replay_pid*.log` files from
  JVM crashes during earlier `mvn test` runs on this machine (native-image related,
  from Windows + JDK 26 + this project's embedded-Mongo test dependency). If `mvn
  clean` fails with a file-lock error on `target/test-classes/...`, just
  `Remove-Item -Recurse -Force target` and rerun — nothing under `target/` is source.
- Local JDK here is 26.0.1 (JAVA_HOME), separate from the JDK 25.0.2 the modernize
  tool installed under `%LOCALAPPDATA%\jdks`. `mvn -version` currently resolves to
  26.0.1. Both work fine now that Spring Boot is on 3.5.16.
- This machine's network intermittently drops TLS mid-download (`bad_record_mac` /
  `short read: unexpected EOF` from both Maven Central and Docker Hub during this
  session) — unrelated to the project, just retry the command if you hit it.
  `backend/Dockerfile`'s two `mvn` RUN steps use `--mount=type=cache,target=/root/.m2`
  with `-U`, so retries reuse whatever was already downloaded instead of restarting
  the whole dependency tree from scratch each time — without this, a single dropped
  connection anywhere in ~150 downloads means the entire `docker compose up --build`
  fails and has to redo everything. Don't remove this mount to "simplify" the
  Dockerfile; it's what makes the build survive a flaky network.

## Backend architecture

- Layering: `controller` → `service` → `repository` (Spring Data MongoDB), with
  `dto` records for request/response shapes and `model` for the two `@Document`
  classes (`User`, `Content`).
- Auth: stateless JWT. `JwtAuthFilter` reads `Authorization: Bearer <token>`,
  validates via `JwtUtil`, and if valid loads the `User` and puts it directly as
  the Spring Security principal — controllers pull the current user via
  `CurrentUserProvider.require()`, not `@AuthenticationPrincipal`.
- `SecurityConfig`: `/api/auth/**` and `GET /api/content/**` are public; content
  mutations require `ROLE_ADMIN`; everything else requires auth. CORS origins come
  from `app.cors.allowed-origins` (`CORS_ALLOWED_ORIGINS` env var).
  `User.role` (`USER`/`ADMIN`) is the only authorization axis.
  passwords hash with BCrypt.
- Errors: `GlobalExceptionHandler` (`@RestControllerAdvice`) maps the three custom
  exceptions in `ApiExceptions` (`NotFound` → 404, `BadRequest` → 400,
  `Unauthorized` → 401) plus bean-validation failures → 400, and a catch-all → 500.
- `RecommendationService` calls OpenAI's Chat Completions API directly via
  WebClient (no SDK) and asks for strict-JSON output; on any failure or missing
  `OPENAI_API_KEY` it falls back to the first 5 catalog items — this fallback path
  is intentional product behavior, not a bug, don't "fix" it into an error.
- `ChatController`/`ChatService` (`POST /api/chat`, auth required) stream a
  catalog-grounded assistant reply as Server-Sent Events, proxying OpenAI's
  streaming Chat Completions API (`"stream": true`) through WebClient and
  returning `Flux<String>` (Spring MVC supports reactive return types for
  streaming even though this app isn't on the WebFlux stack). Same
  graceful-fallback pattern as recommendations when `OPENAI_API_KEY` is
  missing/invalid — falls back to a plain text message instead of erroring.
  **Gotcha that cost real debugging time:** a Spring MVC controller returning
  `Flux`/`SseEmitter` triggers a Servlet async re-dispatch on a *different
  thread* to write the streamed response, and Spring Security's
  `AuthorizationFilter` re-runs on that re-dispatch. `JwtAuthFilter` used to
  only call `SecurityContextHolder.getContext().setAuthentication(...)`, which
  is ThreadLocal and doesn't survive that thread switch — every streaming
  endpoint failed with `AuthorizationDeniedException` even with a valid Bearer
  token. Fixed by also saving the context via
  `RequestAttributeSecurityContextRepository.saveContext(...)` in
  `JwtAuthFilter`, which persists it on the request itself instead of a
  thread, so the async re-dispatch can pick it back up. **Any future streaming
  endpoint (Flux/SseEmitter/StreamingResponseBody) needs this same filter —
  don't strip it out thinking it's dead code**, it silently does nothing for
  ordinary synchronous endpoints and only matters for streaming ones.
- `DataSeeder` (a `CommandLineRunner`) seeds the catalog and the admin account on
  every boot, but is a no-op once data exists (`count() > 0` / `existsByEmail`
  guards) — safe to leave running against a populated DB.
- Lombok `@Data @Builder` is the norm on the two model classes; DTOs are Java
  `record`s (see `AuthDtos`, `ContentDtos`, `MiscDtos`).

## Frontend architecture

- No router — `App.tsx` holds `activeTab` state (`home | search | watch | auth |
  admin | immersive`) and switch-renders panels inside `AnimatePresence`
  (`motion/react`, i.e. Framer Motion's new package name). There's no URL/history
  integration, so tab state doesn't survive a refresh.
- `api/client.ts` is a single Axios instance: attaches the JWT from
  `localStorage['netflix_clone_token']` on every request, and on a 401 response
  clears that + the stored user. Each `api/*Api.ts` file wraps one backend
  resource on top of this client.
- `ThemeContext` persists dark/light to `localStorage['netflix_clone_theme']`,
  defaulting to dark.
- Styling is Tailwind v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js`
  — v4 is CSS-first, config lives in `index.css`).
- `AdminPanel` is gated purely by the sidebar icon showing/hiding based on the
  logged-in user's role — it does not itself re-check role; it just calls the
  same admin endpoints, which the backend enforces.
- Auth state (`authed`) is owned by `App.tsx` and passed down explicitly as a
  prop to `TopBar`, `ImmersiveView`, and `OuterSidebar` — those components must
  NOT independently reimplement "am I logged in" logic (there was a real bug
  where `TopBar` ignored auth state entirely and always showed Login/Sign Up).
  `handleAuthSuccess` routes admins straight to the `admin` tab and regular
  users to `home`; `handleSignOut` calls `clearSession()` and resets `authed`.
- `ChatAssistant.tsx` is the floating AI widget (bottom-right, only rendered
  when `authed`), calling `api/chatApi.ts#streamChat`. That file deliberately
  uses raw `fetch` + `ReadableStream`, not axios and not `EventSource` —
  `EventSource` can't send the `Authorization` header, and axios doesn't
  expose the streamed body in browsers without extra config, so fetch is the
  correct choice here, not an inconsistency to "fix" back to axios.

## Conventions to follow when editing

- Keep the controller/service/repository split — don't put Mongo queries in
  controllers or business logic in repositories.
- New protected endpoints: pull the user via `CurrentUserProvider.require()`
  like the existing watchlist/recommendation controllers, not a fresh
  `SecurityContextHolder` call.
- New backend error cases: add/reuse a type in `ApiExceptions` and a handler in
  `GlobalExceptionHandler` rather than returning raw exceptions or ad hoc status
  codes.
- Frontend API calls: add a function to the relevant `api/*Api.ts` file rather
  than calling `apiClient`/`axios` directly from a component.
- This project has no ESLint — `npm run lint` is a type-check only. Don't assume
  lint output means style is being checked.
