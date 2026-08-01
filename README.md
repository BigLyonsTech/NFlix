# Netflix Clone — Spring Boot + MongoDB + React

A full-stack Netflix clone built for a class professional project.

- **Backend:** Java 25, Spring Boot 3, MongoDB, Spring Security + JWT, OpenAI-powered recommendations
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Tests:** JUnit 5 + Mockito (service layer) and Spring Boot integration tests (embedded MongoDB)
- **Containerized:** Docker + Docker Compose (backend + MongoDB run together)

## Project structure

```
netflix-clone/
├── backend/          Spring Boot API (Java 25, Maven)
├── frontend/          React + Vite app
├── docker-compose.yml Runs backend + MongoDB together
└── .env.example        Copy to .env and fill in secrets
```

## Quick start (recommended for your defense — Docker)

1. Copy the env file and fill in your OpenAI key (optional — the recommendations
   endpoint gracefully falls back to popular picks if no key is set):
   ```
   cp .env.example .env
   ```
2. From the project root:
   ```
   docker compose up --build
   ```
3. Backend is live at `http://localhost:8080`, MongoDB at `localhost:27017`.
4. In a separate terminal, run the frontend (Docker Compose only runs the
   backend + DB — the frontend runs locally with Vite for the best dev experience):
   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
5. Open `http://localhost:3000`.

A demo admin account is seeded automatically:
- Email: `admin@netflixclone.com`
- Password: `Admin123!`

## Running without Docker

**Backend:**
```
cd backend
# requires a local MongoDB running on localhost:27017, or set MONGODB_URI
mvn spring-boot:run
```

**Frontend:**
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Running the backend tests

```
cd backend
mvn test
```

Includes service-layer unit tests (Mockito) for auth, content, and watchlist
logic, JWT utility tests, and a Spring Boot integration test that spins up an
embedded MongoDB instance and exercises the real signup/login/auth-protected
endpoints through MockMvc.

## Environment variables (backend)

| Variable | Default | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/netflixclone` | Mongo connection string |
| `JWT_SECRET` | dev placeholder | Signing key for JWTs — set a real one in production |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |
| `OPENAI_API_KEY` | empty | Enables the "Recommended For You" row. Without it, the endpoint falls back to a popular-picks list — nothing breaks. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model used for recommendations |

## API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/content` | — | Browse/search (`?search=`, `?category=`) |
| GET | `/api/content/{id}` | — | Content detail |
| POST/PUT/DELETE | `/api/content/**` | Admin | Manage catalog |
| GET | `/api/watchlist` | User | Get saved list |
| POST/DELETE | `/api/watchlist/{id}` | User | Add/remove from list |
| GET | `/api/continue-watching` | User | Resume progress |
| PUT | `/api/continue-watching/{id}` | User | Update progress |
| GET | `/api/recommendations` | User | OpenAI-powered picks |
| POST | `/api/chat` | User | Streams a catalog-grounded AI assistant reply (SSE) |

## Notes for your defense

- The catalog is seeded automatically on first backend start (`DataSeeder`) —
  no manual data entry needed for a live demo.
- **Admin panel:** log in with the seeded admin account
  (`admin@netflixclone.com` / `Admin123!`) and a shield icon appears in the
  sidebar — that opens a full CRUD screen (add/edit/delete titles, set
  category, genres, poster/background images) backed by the real
  `/api/content` admin endpoints. Regular signups never see this icon since
  it's gated by the account's role.
- If you don't want to expose a real OpenAI key during the demo, just leave
  `OPENAI_API_KEY` unset — the recommendations row still renders using a
  graceful fallback, so nothing looks broken.
- MongoDB was chosen deliberately here (over a relational DB) since the
  content documents (genres, ratings, seasons) don't need joins, and it
  matches prior hands-on experience with MongoDB.
