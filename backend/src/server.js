import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8080)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'task-tracker-backend',
    timestamp: new Date().toISOString(),
  })
})

app.post('/api/chat', (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message : ''

  res.status(200).json({
    reply: `Demo response: you said "${message}"`,
    provider: 'google-ai-studio',
    connected: false,
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${port}`)
})
