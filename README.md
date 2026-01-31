# Tally

Tally - Your Todoist Command Center — a personalized productivity dashboard with mission control views for project visualization.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

## What is Tally?

Tally is a rebranded, enhanced fork of the original [uncazzy/todoist-dashboard](https://github.com/uncazzy/todoist-dashboard) project. It adds Mission Control views, project health signals, and a clean, fast UI for tracking your work at a glance.

## Mission Control Views

- **Kanban** — project-level flow with manual status overrides
- **Timeline** — roadmap-style span view with today marker
- **Tiles** — bento grid with progress, health, and due stats
- **Matrix** — sortable status table with filters

## Features

- 📊 Deep task analytics and productivity insights
- 🧭 Mission Control project overview experiments
- ✅ Project health scoring, velocity, and stale signals
- 🔄 Recurring task tracking and streak analytics
- 📥 Exportable dashboard reports
- 🌙 Dark mode interface
- 📱 Mobile-friendly layouts

## Technology Stack

- **Next.js 15** (pages router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js**
- **Todoist API**
- **ECharts / D3** for visualizations

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A Todoist account
- Todoist OAuth integration credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cpapescrim1106/tally.git
cd tally
```

2. Install dependencies:
```bash
npm install
```

3. Set up OAuth and environment variables:

   a. Create a Todoist OAuth integration:
   - Go to [Todoist App Management Console](https://developer.todoist.com/appconsole.html)
   - Create a new app
   - Set your OAuth redirect URI to `http://localhost:3000/api/auth/callback/todoist`
   - Copy your Client ID and Client Secret

   b. Create a `.env.local` file:
   ```env
   # Todoist OAuth
   TODOIST_CLIENT_ID=your-todoist-client-id
   TODOIST_CLIENT_SECRET=your-todoist-client-secret

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Optional: use generated dummy dataset
   USE_DUMMY_DATA=false
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and authenticate with Todoist.

## Dummy Data & Development Mode

To develop without a real Todoist account, generate a dummy dataset:

```bash
cd test/scripts
python generate_full_dataset.py --projects 6 --active-tasks 75 --completed-tasks 1500 --months 12
```

Then set `USE_DUMMY_DATA=true` in `.env.local` to load `test/data/dummy-dataset.json`.

See `test/README.md` for additional generators and usage tips.

## Docker

Build and run locally:

```bash
docker build -t tally:test .
docker run -p 3000:3000 --env-file .env.local tally:test
```

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for guidelines.

## Disclaimer

Tally is an independent project and is not affiliated with, sponsored by, or endorsed by Todoist or Doist. Todoist is a trademark of Doist.

## License & Attribution

This project is licensed under the MIT License. Tally is based on the original [uncazzy/todoist-dashboard](https://github.com/uncazzy/todoist-dashboard) project by Azzy.
