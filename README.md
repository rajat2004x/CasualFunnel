# CausalFunnel Analytics

A small product analytics platform that captures browser page views and clicks, stores them in MongoDB, and presents sessions, journeys, and click behavior in a React dashboard.

## Architecture

```text
Demo website → tracker SDK → Express API → MongoDB → React dashboard
```

## Features

- Reusable, framework-independent tracker SDK
- Persistent browser session IDs
- `page_view` and `click` event ingestion
- MongoDB-backed session aggregation
- Chronological session journeys
- Page click heatmap visualization
- Responsive React/Vite dashboard
- Empty, loading, and error states

## Tech stack

- Node.js, Express, Mongoose
- MongoDB
- React, Vite, React Router, Tailwind CSS
- Axios, Recharts, Lucide React
- Plain HTML/CSS/JavaScript demo store

## Project structure

- `server/` API, MongoDB connection, model, services, controllers, and routes
- `tracker/` reusable browser tracking SDK
- `demo/` tracked e-commerce-style demo page
- `client/` React analytics dashboard

## Setup

Install dependencies:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

Copy the environment examples and adjust values if needed:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

The server expects:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/causalfunnel_analytics
CLIENT_URL=http://localhost:5173
```

The client uses:

```env
VITE_API_URL=http://localhost:5000
```

MongoDB must be running locally or `MONGODB_URI` can point to a MongoDB Atlas deployment. The API intentionally does not start its HTTP listener until MongoDB connects successfully.

## Run locally

Start both applications:

```bash
npm run dev
```

Then open:

- Dashboard: `http://localhost:5173/dashboard`
- Demo store: serve the repository from an HTTP server and open `demo/index.html`
- API health: `http://localhost:5000/api/health`

The demo tracker sends events to `POST http://localhost:5000/api/events`. It uses `localStorage` key `cf_session_id`, so refreshes in the same browser keep the same session.

For quick sample data, after MongoDB is available:

```bash
cd server
npm run seed
```

The seed script is never run automatically.

## Dashboard

- **Overview** shows session, event, page-view, and click totals.
- **Sessions** lists sessions ordered by most recent activity.
- **Session journey** shows ordered page views and clicks with coordinates.
- **Heatmap** overlays stored click coordinates on a representative page preview.

The heatmap assumes tracker coordinates are browser viewport coordinates with a reference viewport of `1440 × 900`. The preview is a normalized representation rather than a screenshot, so points are intentionally approximate when the viewer's viewport differs.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health |
| POST | `/api/events` | Store a validated event |
| GET | `/api/sessions` | Session summaries |
| GET | `/api/sessions/:sessionId/events` | Ordered session events |
| GET | `/api/pages` | Distinct observed page URLs |
| GET | `/api/heatmap?pageUrl=<url>` | Clicks for one page |
| GET | `/api/analytics/summary` | Aggregate totals |

## Event schema

```json
{
  "sessionId": "browser-session-id",
  "type": "click",
  "pageUrl": "http://localhost:5173/demo/index.html#products",
  "timestamp": "2026-10-15T12:00:00.000Z",
  "coordinates": { "x": 240, "y": 320 },
  "metadata": {}
}
```

`sessionId`, `type`, `pageUrl`, and `timestamp` are required. Clicks require finite, non-negative `x` and `y` coordinates. Page views do not require coordinates.

## Testing

Run model validation:

```bash
cd server
npm run test:model
```

Build the dashboard:

```bash
cd client
npm run build
```

The API and seed script require a live MongoDB connection for runtime verification.

## Design decisions and trade-offs

- Mongoose validation remains the source of truth for event shape; the API maps validation errors to HTTP 400.
- Analytics queries use MongoDB aggregation and indexed filters rather than loading all events into Node.js.
- The tracker uses `fetch` asynchronously and logs failures without interrupting the host page.
- The demo is static and has no commerce backend because its purpose is generating realistic analytics events.
- The heatmap uses normalized coordinates instead of claiming pixel-perfect screenshot alignment.

## Future improvements

Pagination, retention controls, richer normalized page metadata, event batching, authenticated multi-project workspaces, and automated integration tests against a disposable MongoDB instance.
