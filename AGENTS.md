# AGENTS.md

## Project shape

- `frontend/` is a static vanilla-JS app. There is no bundler, install step, or build: serve `frontend/HTML_Pagina/` and open `index.html`. `frontend/package.json` is a placeholder whose `test` script always fails; `frontend/index.js` is an unused `console.log` stub.
- `backend/` is the real Spring Boot app: Java 21, Spring Boot 4.1.1, Maven wrapper. Entry point: `backend/src/main/java/org/example/worktable/WorkTableApplication.java`.
- `backend/WorkTable/` is a legacy standalone Maven archetype/JDBC copy. It is **not** a module of `backend/pom.xml`; edits there do not affect the running app.
- `backend/src/Main.java` is an IDE scratch hello-world, not an entrypoint.
- No CI, lint, formatter, typecheck, or codegen is configured. Verification is backend tests plus a manual browser check.

## Commands (Windows)

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd test -Dtest=WorkTableApplicationTests   # single test
.\mvnw.cmd spring-boot:run                          # http://localhost:8080
```

- On Bash/macOS/Linux use `./mvnw` instead of `.\mvnw.cmd`.
- `.\mvnw.cmd test` passes (1 test: `contextLoads`); it does not exercise controllers, services, or the database.
- Frontend: `python -m http.server 8000` from `frontend/HTML_Pagina`, then open `http://localhost:8000`. Opening the HTML directly mostly works, but a server is safer.

## Non-obvious constraints

- **Encoding:** sources are UTF-8 without BOM. Keep them that way: Maven fails on a UTF-16 `pom.xml`, and Windows PowerShell 5.1's `Out-File` writes UTF-16 by default; specify UTF-8 explicitly.
- **Database:** the active app uses raw JDBC, not Spring Data/JPA. Connection details are hardcoded in `backend/src/main/java/org/example/connection/ConnectionFactory.java` (localhost:3306/`tarefa_db`, user `root`); `application.properties` only contains the app name. The only schema file is `backend/WorkTable/src/main/resources/db/migration/V1__Criar_Tabelas.sql`, which is not on the active app's classpath. Repository SQL disagrees with it (`TAREFAS`/`NOME`/`LOGIN` vs `TAREFA`/`NOME_TAREFA`), so verify the live schema before DB changes.
- **Docker:** `backend/Dockerfile` is a non-working stub (two `FROM`s, `top` entrypoint, no Java build). Do not treat it as the deploy path without rewriting it.
- **No frontend/backend integration:** the only endpoint is `GET /teste`; the frontend uses no `fetch`/`localStorage` and loses all state on reload. The login form posts to `/login`, which does not exist; auth/Google/persistence are UI placeholders.
- **Frontend globals:** scripts are classic (not ES modules) and share global scope; order in `index.html` matters (`task-manager.js` -> `box-interactions.js` -> Flatpickr CDN -> `box-factory.js` -> ...). `folder-manager.js` relies on globals from earlier files. Flatpickr and fonts load from CDNs, so the date picker needs network access.
- **Task markup:** task templates reuse IDs when cloned (e.g. `caixaDeTarefas`), so `document.getElementById` inside a task is unreliable; scope queries to the task element.
- **Language:** UI strings and many identifiers are Portuguese (pt-BR). Keep new UI text Portuguese and follow the existing global-function style unless doing a deliberate refactor.
- **README:** useful overview but stale in places (for example, it says Java 17+ while `pom.xml` targets 21, and its Docker/DB claims are aspirational). Trust `pom.xml`, scripts, and source over prose.
