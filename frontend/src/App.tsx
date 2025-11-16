import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Finance Tracker
          </h1>
          <p className="text-gray-600">
            Your personal finance management application
          </p>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
