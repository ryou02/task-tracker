import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8080)
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174']
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins
const groqApiKey = process.env.GROQ_API_KEY
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
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

async function generateGroqReply(message) {
  if (!groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in backend .env')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a task manager app. Be concise and practical.',
        },
        { role: 'user', content: message },
      ],
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq request failed: ${errorText || response.statusText}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || 'I could not generate a reply.'
}

app.post('/api/agent', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  try {
    const reply = await generateGroqReply(message)
    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Groq request failed.',
    })
  }
})

app.post('/api/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  try {
    const reply = await generateGroqReply(message)
    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Groq request failed.',
    })
  }
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${port}`)
})
