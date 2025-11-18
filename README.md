# AI-Powered Personal Finance Tracker

A full-stack web application that helps users monitor spending, manage budgets, and understand financial patterns through visual dashboards and AI-generated insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)

## 🌟 Features

- **💰 Transaction Management**: Upload CSV files or manually enter transactions with detailed categorization
- **📊 Budget Tracking**: Create budgets and track spending in real-time with progress visualization
- **📈 Visual Analytics**: Interactive charts showing spending trends, category breakdowns, and budget comparisons
- **🤖 AI Insights**: Natural language summaries, spending analysis, and personalized recommendations
- **🔔 Budget Alerts**: Automatic notifications when approaching or exceeding spending limits (80% and 100% thresholds)
- **📥 Export Functionality**: Download AI insights as text or PDF for record-keeping
- **🔐 Secure Authentication**: User authentication and data isolation with Supabase Auth
- **📱 Responsive Design**: Mobile-friendly interface that works on all devices

## 🚀 Live Demo

- **Frontend**: [Add your Netlify URL here after deployment]
- **Backend API**: [Add your Render URL here after deployment]
- **GitHub Repository**: https://github.com/ikunalgoel/PFT

> **Note**: After deploying your application, update these URLs with your actual deployment links. See the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for step-by-step deployment instructions.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **TailwindCSS** for modern, responsive styling
- **Recharts** for interactive data visualizations
- **React Query** for efficient data fetching and caching
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **Papa Parse** for CSV parsing
- **Vite** for fast build tooling

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **Supabase** (PostgreSQL) for database and authentication
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **Node-cron** for scheduled tasks
- **AI Agent Integration** for insights generation

### Infrastructure
- **Netlify** for frontend hosting
- **Render/Fly.io** for backend deployment
- **Supabase Cloud** for managed database
- **GitHub Actions** for CI/CD

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

## 🚀 Getting Started

### Quick Start

For detailed step-by-step instructions, see the **[Complete Setup Guide](docs/SETUP_GUIDE.md)**.

For a fast reference of common commands and tasks, see the **[Quick Reference Guide](QUICK_REFERENCE.md)**.

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier available)
- **Git** for version control
- **AI Agent API Key** (optional, for AI insights feature)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ikunalgoel/PFT.git
   cd PFT
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up Supabase database**:
   - Create a new Supabase project at https://supabase.com
   - Run the database schema from `backend/supabase/schema.sql`
   - Obtain your Supabase credentials (URL, anon key, service key)
   - See detailed guide: [backend/supabase/SETUP.md](backend/supabase/SETUP.md)

4. **Configure environment variables**:

   **Backend** (`backend/.env`):
   ```bash
   PORT=5000
   NODE_ENV=development
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   
   JWT_SECRET=your_jwt_secret  # Generate with: openssl rand -base64 32
   AI_AGENT_API_KEY=your_ai_agent_api_key  # Optional
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (`frontend/.env`):
   ```bash
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   See complete guide: [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

5. **Verify setup**:
   ```bash
   cd backend
   npm run dev
   # Check http://localhost:5000/health for database status
   ```

### Development

Run both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Building for Production

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend
```

### Need Help?

- 📖 [Complete Setup Guide](docs/SETUP_GUIDE.md) - Detailed step-by-step instructions
- 🔧 [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions
- 💬 [GitHub Discussions](https://github.com/ikunalgoel/PFT/discussions) - Ask questions

## Deployment

This project is configured for easy deployment with automated CI/CD pipelines.

### Quick Deployment Guide

**Prerequisites:**
- GitHub repository
- Supabase project with schema deployed
- Render account (for backend)
- Netlify account (for frontend)

**Steps:**

1. **Deploy Backend to Render:**
   - Connect GitHub repository to Render
   - Render auto-detects `render.yaml` configuration
   - Set environment variables in Render dashboard
   - See detailed guide: [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md)

2. **Deploy Frontend to Netlify:**
   - Connect GitHub repository to Netlify
   - Netlify auto-detects `netlify.toml` configuration
   - Set environment variables in Netlify dashboard
   - See detailed guide: [`frontend/DEPLOYMENT.md`](frontend/DEPLOYMENT.md)

3. **Configure CI/CD:**
   - Set up GitHub secrets for automated deployments
   - See guide: [`.github/workflows/README.md`](.github/workflows/README.md)

4. **Verify Deployment:**
   - Use the deployment checklist: [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)

### Deployment Files

- `netlify.toml` - Netlify configuration
- `render.yaml` - Render configuration
- `fly.toml` - Fly.io configuration (alternative)
- `backend/Dockerfile` - Docker container configuration
- `.github/workflows/` - CI/CD pipelines

### Automated Deployments

Pushing to the `main` branch automatically:
1. Runs tests for frontend and backend
2. Builds both applications
3. Deploys backend to Render
4. Deploys frontend to Netlify
5. Runs health checks
6. Sends deployment notifications

See [CI/CD documentation](.github/workflows/README.md) for details.

## 📖 Documentation

### Core Documentation
- **[API Reference](docs/API.md)** - Complete API documentation with request/response examples
- **[CSV Upload Guide](docs/CSV_UPLOAD.md)** - Detailed CSV format specifications and examples
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Deployment Guides
- **[Frontend Deployment](frontend/DEPLOYMENT.md)** - Deploy to Netlify
- **[Backend Deployment](backend/DEPLOYMENT.md)** - Deploy to Render or Fly.io
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment verification
- **[CI/CD Setup](.github/workflows/README.md)** - Automated deployment configuration

### Additional Resources
- **[Authentication Guide](frontend/AUTHENTICATION.md)** - Supabase Auth integration
- **[Database Setup](backend/supabase/SETUP.md)** - Database schema and configuration
- **[Middleware Documentation](backend/MIDDLEWARE_SETUP.md)** - Backend middleware setup
- **[Error Handling](frontend/src/components/ERROR_HANDLING.md)** - Frontend error handling patterns

## 📊 CSV Upload Format

Transactions can be uploaded via CSV with the following format:

### Minimal Format (Required Columns Only)
```csv
date,amount,category
2024-01-15,45.50,Groceries
2024-01-16,12.00,Transportation
2024-01-17,85.00,Utilities
```

### Complete Format (All Columns)
```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Whole Foods,Weekly shopping
2024-01-16,12.00,Transportation,Uber,Ride to work
2024-01-17,85.00,Utilities,PG&E,Monthly electric bill
```

**Required columns**: `date` (YYYY-MM-DD), `amount` (positive number), `category` (text)  
**Optional columns**: `merchant` (text), `notes` (text)

**Sample Files**:
- [Minimal Example](examples/transactions-minimal.csv)
- [Complete Example](examples/transactions-complete.csv)

For detailed format specifications, validation rules, and troubleshooting, see the [CSV Upload Guide](docs/CSV_UPLOAD.md).

## 🔌 API Overview

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and database status |
| `/api/transactions` | GET | Get all transactions with filters |
| `/api/transactions` | POST | Create single transaction |
| `/api/transactions/bulk` | POST | Bulk upload transactions (CSV) |
| `/api/transactions/:id` | PUT | Update transaction |
| `/api/transactions/:id` | DELETE | Delete transaction |
| `/api/budgets` | GET | Get all budgets |
| `/api/budgets` | POST | Create budget |
| `/api/budgets/:id/progress` | GET | Get budget progress and alerts |
| `/api/analytics/summary` | GET | Get spending summary |
| `/api/analytics/trends` | GET | Get spending trends over time |
| `/api/analytics/categories` | GET | Get category breakdown |
| `/api/insights/generate` | POST | Generate AI insights |
| `/api/insights/latest` | GET | Get latest AI insights |
| `/api/insights/export` | POST | Export insights as text/PDF |

**Authentication**: All endpoints (except `/health`) require Bearer token authentication.

**Rate Limits**:
- Standard endpoints: 100 requests per 15 minutes
- CSV upload: 10 requests per 15 minutes
- AI insights: 5 requests per 15 minutes

For complete API documentation with request/response examples, see the [API Reference](docs/API.md).

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Test Coverage

```bash
# Backend test coverage
cd backend
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow existing code style (ESLint + Prettier)
- Ensure all tests pass before submitting PR

## 📝 Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# AI Agent Configuration (Optional)
AI_AGENT_API_KEY=your_ai_agent_api_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.example` files in `backend/` and `frontend/` directories for templates.

## 🔒 Security

- All API endpoints (except health check) require authentication
- Row Level Security (RLS) enabled on all database tables
- JWT tokens for secure authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- HTTPS enforced in production
- Security headers configured (Helmet.js)

**Security Issues**: Please report security vulnerabilities privately via GitHub Security Advisories.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for database and authentication
- [Recharts](https://recharts.org) for beautiful charts
- [TailwindCSS](https://tailwindcss.com) for styling
- [React Query](https://tanstack.com/query) for data fetching

## 📞 Support

### Documentation
- [API Reference](docs/API.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [CSV Upload Guide](docs/CSV_UPLOAD.md)

### Get Help
- **Issues**: [GitHub Issues](https://github.com/ikunalgoel/PFT/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ikunalgoel/PFT/discussions)
- **Email**: [Create an issue for support]

## 🗺️ Roadmap

- [ ] PDF export for AI insights
- [ ] Mobile app (React Native)
- [ ] Recurring transaction support
- [ ] Multi-currency support
- [ ] Budget templates
- [ ] Spending goals and challenges
- [ ] Data export (full backup)
- [ ] Integration with bank APIs
- [ ] Collaborative budgets (family/shared)
- [ ] Advanced analytics and reports

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: January 2024

## 🌐 Deployed Application

### Live URLs

- **Frontend**: [Add your Netlify URL here after deployment]
- **Backend API**: [Add your Render URL here after deployment]
- **API Health Check**: [Add your backend URL]/health

> **To add your deployed URLs**: After completing deployment, replace the placeholder text above with your actual URLs from Netlify and Render.

### Repository & Documentation

- **GitHub Repository**: https://github.com/ikunalgoel/PFT
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/ikunalgoel/PFT/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ikunalgoel/PFT/discussions)

### Quick Links

- [API Documentation](docs/API.md)
- [CSV Upload Guide](docs/CSV_UPLOAD.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

---

**Built with ❤️ by the AI Finance Tracker Team**

If you find this project helpful, please consider giving it a ⭐ on GitHub!

