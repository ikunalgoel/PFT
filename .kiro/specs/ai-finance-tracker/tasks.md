# Implementation Plan

- [x] 1. Set up project structure and initialize repositories





  - Create monorepo structure with frontend and backend directories
  - Initialize React app with TypeScript and TailwindCSS
  - Initialize Express backend with TypeScript
  - Configure ESLint, Prettier, and TypeScript configs
  - Set up Git repository and create .gitignore files
  - Create README with project overview and setup instructions
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 2. Configure Supabase database and authentication





  - Create Supabase project and obtain credentials
  - Create database schema (transactions, budgets, budget_alerts, ai_insights tables)
  - Set up Row Level Security (RLS) policies for data isolation
  - Create database indexes for optimized queries
  - Configure Supabase Auth for user management
  - Set up environment variables for database connection
  - _Requirements: 13.1, 13.4, 13.5_

- [x] 3. Implement backend data models and database layer


  - Create TypeScript interfaces for Transaction, Budget, Alert, AIInsights
  - Implement Supabase client configuration and connection handling
  - Create database utility functions for CRUD operations
  - Implement retry logic for failed database operations
  - Add database error handling and logging
  - _Requirements: 13.2, 13.3, 13.5_

- [x] 4. Build Transaction Service and API endpoints




- [x] 4.1 Implement TransactionService with CRUD operations


  - Create TransactionService class with create, findAll, findById, update, delete methods
  - Implement transaction validation logic
  - Add filtering capabilities (by date range, category)
  - Implement bulk transaction creation for CSV uploads
  - _Requirements: 1.3, 1.4, 2.2, 2.3_

- [x] 4.2 Create Transaction API endpoints


  - Implement POST /api/transactions endpoint
  - Implement POST /api/transactions/bulk endpoint
  - Implement GET /api/transactions with query filters
  - Implement GET /api/transactions/:id endpoint
  - Implement PUT /api/transactions/:id endpoint
  - Implement DELETE /api/transactions/:id endpoint
  - Add request validation middleware
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.3 Write unit tests for TransactionService


  - Create test cases for CRUD operations
  - Test validation logic with valid and invalid data
  - Test error handling scenarios
  - _Requirements: 1.3, 2.2, 2.5_

- [x] 5. Build Budget Service and API endpoints




- [x] 5.1 Implement BudgetService with budget management


  - Create BudgetService class with create, findAll, findById, update, delete methods
  - Implement budget progress calculation logic
  - Implement threshold checking for alerts (80% warning, 100% critical)
  - Add budget period reset functionality
  - _Requirements: 3.1, 3.2, 3.4, 4.1, 4.2, 4.4, 5.1, 5.2_

- [x] 5.2 Create Budget API endpoints


  - Implement POST /api/budgets endpoint
  - Implement GET /api/budgets endpoint
  - Implement GET /api/budgets/:id endpoint
  - Implement PUT /api/budgets/:id endpoint
  - Implement DELETE /api/budgets/:id endpoint
  - Implement GET /api/budgets/:id/progress endpoint
  - Add request validation middleware
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 5.4_

- [x] 5.3 Write unit tests for BudgetService


  - Test budget CRUD operations
  - Test progress calculation logic
  - Test threshold alert generation
  - Test period reset functionality
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [x] 6. Implement Analytics Service and API endpoints




- [x] 6.1 Create AnalyticsService for data aggregation


  - Implement getSummary method for total spending and category breakdown
  - Implement getTrends method for time-based spending analysis
  - Implement getCategoryBreakdown for pie chart data
  - Implement getBudgetComparison for budget vs actual data
  - Add caching layer for frequently accessed analytics
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.2 Create Analytics API endpoints


  - Implement GET /api/analytics/summary endpoint
  - Implement GET /api/analytics/trends endpoint
  - Implement GET /api/analytics/categories endpoint
  - Add query parameter support for date range and category filters
  - _Requirements: 6.4, 6.5_

- [x] 6.3 Write unit tests for AnalyticsService


  - Test summary calculations with sample data
  - Test trend analysis with various time periods
  - Test category breakdown calculations
  - Test caching behavior
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Implement AI Insights Service and integration











- [x] 7.1 Create AIInsightsService with prompt engineering



  - Implement buildPrompt method to construct AI prompts from analytics data
  - Implement generateInsights method to call Kiro AI Agent
  - Implement parseAIResponse method to parse and validate AI responses
  - Add error handling for AI service failures with graceful degradation
  - Implement caching for AI insights (24-hour cache)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 7.2 Create AI Insights API endpoints


  - Implement POST /api/insights/generate endpoint
  - Implement GET /api/insights/latest endpoint
  - Implement POST /api/insights/export endpoint for PDF/text export
  - Store generated insights in ai_insights table
  - _Requirements: 9.1, 9.2, 9.5, 10.1, 10.2_


- [x] 8. Set up Express server with middleware and routing




  - Configure Express app with CORS, body-parser, and security middleware
  - Implement authentication middleware using Supabase JWT
  - Set up API routes for transactions, budgets, analytics, and insights
  - Add global error handling middleware
  - Implement rate limiting for API endpoints
  - Create /health endpoint for deployment health checks
  - _Requirements: 11.4, 13.2_

- [x] 9. Build frontend project structure and routing





  - Set up React Router for navigation
  - Create page components (Dashboard, Transactions, Budgets)
  - Implement authentication context and protected routes
  - Configure React Query for data fetching and caching
  - Set up Axios instance with base URL and interceptors
  - Create global state management with Context API
  - _Requirements: 7.1, 7.2_

- [x] 10. Implement Transaction Management UI





- [x] 10.1 Create TransactionList component


  - Build table/list view for displaying transactions
  - Add sorting and filtering capabilities
  - Implement pagination for large transaction lists
  - Add edit and delete action buttons
  - _Requirements: 1.4, 2.1_

- [x] 10.2 Create TransactionForm component


  - Build modal form for adding/editing transactions
  - Implement form validation for required fields
  - Add date picker, category dropdown, and amount input
  - Handle form submission and API integration
  - Display success/error messages
  - _Requirements: 1.2, 2.1, 2.2, 2.4, 2.5_

- [x] 10.3 Create CSVUploader component


  - Implement drag-and-drop file upload interface
  - Add CSV parsing using Papa Parse library
  - Validate CSV format and required columns
  - Display preview of parsed transactions
  - Handle bulk upload API call
  - Show upload progress and results
  - _Requirements: 1.1, 1.5_

- [x] 11. Implement Budget Management UI





- [x] 11.1 Create BudgetList component


  - Display all budgets in card or list format
  - Show budget progress with visual progress bars
  - Add edit and delete action buttons
  - Display budget details (amount, period, category)
  - _Requirements: 3.3, 4.3_

- [x] 11.2 Create BudgetForm component


  - Build modal form for creating/editing budgets
  - Add inputs for name, amount, period type, and category
  - Implement form validation
  - Handle form submission and API integration
  - _Requirements: 3.1, 3.4_

- [x] 11.3 Create BudgetCard component with progress visualization


  - Display individual budget with progress bar
  - Show current spending vs limit
  - Calculate and display percentage used
  - Color-code based on threshold (green, yellow, red)
  - _Requirements: 4.2, 4.3_

- [x] 11.4 Create AlertBanner component


  - Display active budget alerts prominently
  - Show warning alerts (80% threshold) in yellow
  - Show critical alerts (100% threshold) in red
  - Include budget name, current spending, and limit in alert message
  - Add dismiss functionality for resolved alerts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Implement Dashboard with visualizations




- [x] 12.1 Create Dashboard layout and SummaryCards


  - Build responsive dashboard grid layout
  - Create summary cards for total spending, active budgets, and alert count
  - Fetch and display real-time data
  - Add loading states and error handling
  - _Requirements: 7.1, 7.4_

- [x] 12.2 Create FilterBar component


  - Implement date range picker for filtering
  - Add category multi-select dropdown
  - Apply filters to all dashboard components
  - Persist filter state across component updates
  - _Requirements: 6.4, 6.5_

- [x] 12.3 Implement CategoryPieChart component


  - Integrate Recharts or Chart.js library
  - Fetch category breakdown data from analytics API
  - Render pie chart with category-wise spending distribution
  - Add hover tooltips with detailed information
  - Apply filters from FilterBar
  - _Requirements: 6.1, 6.4, 6.5, 7.3_

- [x] 12.4 Implement TrendLineChart component


  - Create line or bar chart for spending trends
  - Support daily, weekly, and monthly views
  - Fetch trend data from analytics API
  - Add interactive tooltips and legends
  - Apply date range filters
  - _Requirements: 6.2, 6.4, 6.5, 7.3_

- [x] 12.5 Implement BudgetProgressChart component


  - Create horizontal bar chart comparing budget vs actual spending
  - Display all active budgets
  - Color-code bars based on threshold status
  - Add labels showing amounts and percentages
  - _Requirements: 6.3, 6.4, 6.5_

- [x] 13. Implement AI Insights Panel UI





- [x] 13.1 Create InsightsPanel container component


  - Build dedicated panel for AI insights on dashboard
  - Add "Generate Insights" button to trigger AI analysis
  - Display loading state during AI generation
  - Handle errors with user-friendly messages
  - _Requirements: 9.2, 9.3_

- [x] 13.2 Create insight display components


  - Create MonthlySummary component for overview text
  - Create CategoryInsights component to display category analysis
  - Create SpendingAlerts component for unusual patterns
  - Create Recommendations component for savings suggestions
  - Create Projections component for future spending predictions
  - Format all insights with proper headings and structure
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.3, 9.4_

- [x] 13.3 Create ExportButton component


  - Add export button to insights panel
  - Implement export functionality for PDF and text formats
  - Include generation date and period in exported document
  - Trigger file download on export
  - Preserve formatting in exported document
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 14. Implement authentication and user management





  - Integrate Supabase Auth in frontend
  - Create login and signup pages
  - Implement authentication context and hooks
  - Add protected route wrapper for authenticated pages
  - Handle token refresh and session management
  - Add logout functionality
  - _Requirements: 11.4_

- [x] 15. Add responsive design and mobile optimization





  - Ensure all components are mobile-responsive
  - Test dashboard layout on various screen sizes
  - Optimize charts for mobile viewing
  - Adjust navigation for mobile devices
  - Test touch interactions for mobile users
  - _Requirements: 7.5_

- [x] 16. Implement error handling and loading states


  - Add error boundaries for component failures
  - Create reusable error message components
  - Implement toast notifications for transient errors
  - Add loading spinners and skeletons for async operations
  - Implement retry mechanisms for failed API requests
  - _Requirements: 2.5, 7.4_

- [x] 17. Set up deployment configuration





- [x] 17.1 Configure frontend deployment on Netlify


  - Create netlify.toml configuration file
  - Set up environment variables (API_URL, SUPABASE_URL, SUPABASE_ANON_KEY)
  - Configure build command and publish directory
  - Set up automatic deployments from GitHub main branch
  - Test deployment and verify functionality
  - _Requirements: 11.1, 11.3, 12.4_

- [x] 17.2 Configure backend deployment on Render or Fly.io


  - Create deployment configuration file (render.yaml or fly.toml)
  - Set up environment variables (DATABASE_URL, AI_AGENT_API_KEY, JWT_SECRET)
  - Configure health check endpoint
  - Set up automatic deployments from GitHub main branch
  - Test deployment and verify API accessibility
  - _Requirements: 11.2, 11.3, 12.4_

- [x] 17.3 Set up CI/CD pipeline with GitHub Actions


  - Create GitHub Actions workflow file
  - Configure automated testing on pull requests
  - Set up automated deployment on main branch merge
  - Add build and test steps for frontend and backend
  - Configure deployment notifications
  - _Requirements: 12.1, 12.5_

- [x] 18. Create comprehensive documentation


  - Write detailed README with setup instructions
  - Document API endpoints with request/response examples
  - Add environment variable configuration guide
  - Include deployment instructions for each platform
  - Document CSV upload format requirements
  - Add troubleshooting section
  - Include deployed app URL and GitHub repository link
  - _Requirements: 12.2, 12.3_
-

- [x] 19. Perform end-to-end testing

- [ ] 19. Perform end-to-end testing

  - Test complete user flow: signup → upload CSV → view dashboard
  - Test budget creation → transaction addition → alert generation
  - Test AI insights generation → export functionality
  - Test all CRUD operations for transactions and budgets
  - Test error scenarios and edge cases
  - Verify mobile responsiveness
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 4.1, 8.1, 10.1_
-

- [x] 20. Performance optimization and monitoring

  - Run Lighthouse audit and optimize performance scores
  - Optimize bundle size with code splitting
  - Implement lazy loading for charts and heavy components
  - Add performance monitoring for API response times
  - Optimize database queries with proper indexing
  - Test with large datasets (1000+ transactions)
  - _Requirements: 7.4, 11.3_

- [x] 21. Implement multi-currency support






- [x] 21.1 Create user settings database schema and service

  - Add user_settings table to database schema with currency field
  - Create UserSettings TypeScript interface
  - Implement SettingsRepository with CRUD operations
  - Implement SettingsService for managing user preferences
  - Add database migration for user_settings table
  - _Requirements: 14.2, 14.3, 15.4_


- [x] 21.2 Create currency utilities and configuration

  - Define SUPPORTED_CURRENCIES configuration (GBP, INR)
  - Create CurrencyFormatter utility class
  - Implement currency formatting functions with Intl.NumberFormat
  - Add currency symbol mapping
  - Create currency validation helpers
  - _Requirements: 14.4_




- [x] 21.3 Build Settings API endpoints
  - Implement GET /api/settings endpoint
  - Implement PUT /api/settings endpoint
  - Implement POST /api/settings/currency endpoint
  - Add request validation for currency values
  - Add authentication middleware to settings routes
  - _Requirements: 15.2, 15.3, 15.4_




- [x] 21.4 Create Settings UI components
  - Create SettingsPage component with navigation
  - Create CurrencySelector dropdown component
  - Create SettingsForm with validation
  - Add save/cancel functionality
  - Display success/error messages
  - _Requirements: 15.1, 15.2, 15.5_




- [x] 21.5 Implement Currency Context in frontend
  - Create CurrencyContext with React Context API
  - Implement CurrencyProvider component
  - Add formatAmount helper function
  - Add currencySymbol getter
  - Integrate with user settings API
  - _Requirements: 14.4, 14.5_




- [x] 21.6 Update all components to use currency formatting

  - Update TransactionList to display amounts with currency
  - Update BudgetCard to show currency symbols
  - Update Dashboard SummaryCards with currency
  - Update all charts to format currency values
  - Update TransactionForm to show currency symbol
  - Update BudgetForm to show currency symbol
  - _Requirements: 14.4_



- [x] 21.7 Add currency selection during signup
  - Update Signup page to include currency selector
  - Create default user settings on account creation
  - Validate currency selection before signup
  - Store initial currency preference
  - _Requirements: 14.2_

- [x] 22. Implement real AI agent integration





- [x] 22.1 Set up LLM provider configuration


  - Add OpenAI and Anthropic SDK dependencies
  - Create LLMConfig interface and configuration
  - Add environment variables for API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)
  - Create provider selection logic
  - Add model configuration (model name, max tokens, temperature)
  - _Requirements: 16.1_

- [x] 22.2 Create LLM client abstraction


  - Create LLMClient interface
  - Implement OpenAIClient class
  - Implement AnthropicClient class (optional)
  - Add retry logic with exponential backoff
  - Implement timeout handling
  - Add request/response logging
  - _Requirements: 16.1, 16.5_

- [x] 22.3 Update AIInsightsService to use real LLM


  - Replace mock AI call with actual LLM client
  - Update buildPrompt to include currency context
  - Add currency parameter to generateInsights method
  - Implement proper error handling for LLM failures
  - Add fallback to cached insights on LLM errors
  - Update response parsing for LLM output
  - _Requirements: 16.2, 16.3, 16.4, 17.1, 17.2_

- [x] 22.4 Enhance prompt engineering for currency awareness

  - Update prompt template to include currency symbol
  - Add currency-specific context to prompts
  - Format all monetary values in prompts with currency
  - Add instructions for LLM to use currency in responses
  - Test prompts with different currencies
  - _Requirements: 17.1, 17.3, 17.4_

- [x] 22.5 Implement LLM response validation and parsing

  - Create response validator for JSON structure
  - Add schema validation for AI insights
  - Implement error recovery for malformed responses
  - Add currency symbol validation in responses
  - Create fallback insights generator
  - _Requirements: 16.4, 17.5_

- [x] 22.6 Add LLM cost optimization features

  - Implement 24-hour caching for insights
  - Add request batching where possible
  - Implement token counting before requests
  - Add rate limiting per user
  - Create cost monitoring and logging
  - Add configuration for model selection based on query complexity
  - _Requirements: 16.1, 16.5_

- [x] 22.7 Update generate-insights script to use real LLM


  - Replace mock insight generation with LLM calls
  - Add command-line options for testing
  - Implement proper error handling
  - Add progress logging
  - Test with sample data
  - _Requirements: 16.1, 16.2_

- [x] 23. Fix data transformation between backend and frontend





- [x] 23.1 Add camelCase transformation utility






  - Create utility function to convert snake_case to camelCase
  - Add transformation for nested objects and arrays
  - Implement reverse transformation (camelCase to snake_case)
  - Add type-safe transformation helpers
  - _Requirements: 8.1, 9.1_



- [x] 23.2 Update API responses to transform data
  - Add transformation middleware for insights endpoints
  - Transform transaction responses
  - Transform budget responses
  - Transform analytics responses
  - Ensure consistent data format across all endpoints
  - _Requirements: 1.4, 3.3, 8.1_



- [x] 23.3 Fix Projections component data access

  - Ensure projections object has correct property names
  - Add null checks for all projection properties
  - Add default values for missing data
  - Test with real AI-generated insights
  - _Requirements: 8.5, 9.3_

- [x] 24. Integration testing for new features






- [x] 24.1 Test currency support end-to-end


  - Test currency selection during signup
  - Test currency change in settings
  - Verify all amounts display with correct currency
  - Test currency in AI insights
  - Test with both GBP and INR
  - _Requirements: 14.1, 14.4, 14.5, 17.5_

- [x] 24.2 Test real AI integration

  - Test AI insights generation with OpenAI
  - Test error handling when LLM fails
  - Test fallback to cached insights
  - Verify currency context in AI responses
  - Test cost optimization features
  - _Requirements: 16.1, 16.2, 16.5, 17.1_

- [x] 24.3 Test data transformation

  - Verify all API responses use camelCase
  - Test nested object transformations
  - Verify frontend components receive correct data format
  - Test with various data scenarios
  - _Requirements: 8.1, 9.1_
