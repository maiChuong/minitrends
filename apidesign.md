# Limit API calls
You’re thinking about this in exactly the right way — if you want to use your MiniTrends React app as a hub for Meta APIs (Facebook, Instagram, Threads), the key is to minimize API calls so you don’t hit rate limits or waste resources. Since GitHub Pages is static hosting, you can’t run heavy server logic there, but you can design your workflow smartly:

🔑 Principles for Rate-Limit Friendly Design
Batch requests: Instead of calling APIs every time the page loads, fetch data once, store it, and serve cached results.

Scheduled jobs: Run a backend script (e.g., Node.js on a server or GitHub Actions) once or twice per day to pull fresh data.

Static JSON export: Save the API response into a JSON file in your repo. Your React app can read that file instead of hitting Meta APIs directly.

Minimal scope: Only request the fields you need (fields=id,name,followers_count), not full objects.

Thanks for sharing your repo tree — that helps a lot. You’ve got a standard Vite + React structure with src/ for components, public/ for static assets, and no backend code. That means GitHub Pages can only serve static files, so any live API calls to Meta would quickly hit rate limits. The best approach is to pre-fetch data once or twice per day and store it as JSON in public/, then let your React app consume that snapshot.