import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes placeholder
app.get('/api', (_req, res) => {
  res.json({ message: 'AI Finance Tracker API' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
