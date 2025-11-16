# AI-Powered Personal Finance Tracker

A full-stack web application that helps users monitor spending, manage budgets, and understand financial patterns through visual dashboards and AI-generated insights.

## Features

- **Transaction Management**: Upload CSV files or manually enter transactions
- **Budget Tracking**: Create budgets and track spending in real-time
- **Visual Analytics**: Interactive charts showing spending trends and category breakdowns
- **AI Insights**: Natural language summaries and personalized recommendations
- **Budget Alerts**: Automatic notifications when approaching spending limits
- **Export Functionality**: Download AI insights as PDF or text

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- Recharts for data visualization
- React Query for data fetching
- Vite for build tooling

### Backend
- Node.js with Express
- TypeScript
- Supabase (PostgreSQL) for database
- AI integration for insights generation

## Project Structure

```
ai-finance-tracker/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/            # Express backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
└── package.json        # Root package.json for monorepo
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-finance-tracker
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
AI_AGENT_API_KEY=your_ai_agent_api_key
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the database migrations (see `backend/migrations/`)
   - Configure Row Level Security policies

### Development

Run both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

### Building for Production

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend
```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variables in Netlify dashboard

### Backend (Render/Fly.io)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in platform dashboard

## CSV Upload Format

Transactions can be uploaded via CSV with the following format:

```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Whole Foods,Weekly shopping
2024-01-16,12.00,Transportation,Uber,Ride to work
```

Required columns: `date`, `amount`, `category`
Optional columns: `merchant`, `notes`

## API Documentation

### Endpoints

- `GET /health` - Health check
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all budgets
- `GET /api/analytics/summary` - Get spending summary
- `POST /api/insights/generate` - Generate AI insights

See full API documentation in `/docs/api.md` (coming soon)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Deployed Application

- Frontend: [Coming Soon]
- Backend API: [Coming Soon]
- GitHub Repository: [Your Repository URL]

