import { useEffect, useRef, useState } from 'react'
import chatbotAvatar from '../assets/chatbot.jpg'
import sendIcon from '../assets/send.png'
import { useAuth } from '../context/AuthProvider'
import './AgentChatWidget.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'

const seedMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hey, I am your Task Tracker AI helper. Ask me anything about your tasks.',
  },
  {
    id: 2,
    role: 'user',
    text: 'What should I focus on today?',
  },
  {
    id: 3,
    role: 'assistant',
    text: 'Start with items due soon, then do one quick habit streak win.',
  },
]

function AgentChatWidget() {
  const { user, session } = useAuth()
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesRef = useRef(null)
  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const userEmail = user?.email || ''
  const userInitial = userEmail.trim()?.[0]?.toUpperCase() || 'U'

  useEffect(() => {
    if (isMinimized) return
    const node = messagesRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [isMinimized, messages, sending])

  async function handleSend(event) {
    event.preventDefault()
    const next = input.trim()
    if (!next || sending) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: next,
    }
    setMessages((previous) => [...previous, userMessage])
    setInput('')
    setSending(true)

    const accessToken = session?.access_token
    if (!accessToken) {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'No auth token found. Please sign in again and retry.',
        },
      ])
      setSending(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: next }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Request failed.')
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: typeof data?.reply === 'string' ? data.reply : 'No reply received.',
        },
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: error instanceof Error ? error.message : 'Agent request failed.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (isMinimized) {
    return (
      <button
        type="button"
        className="agent-chat-widget__fab"
        onClick={() => setIsMinimized(false)}
        aria-label="Open AI assistant chat"
      >
        <img src={chatbotAvatar} alt="" className="agent-chat-widget__fab-image" />
      </button>
    )
  }

  return (
    <section className="agent-chat-widget" aria-label="AI assistant chat">
      <header className="agent-chat-widget__header">
        <div className="agent-chat-widget__head-label">
          <img
            src={chatbotAvatar}
            alt=""
            className="agent-chat-widget__avatar agent-chat-widget__avatar--assistant"
          />
          <div>
            <p className="agent-chat-widget__title">Task AI Agent</p>
            <p className="agent-chat-widget__subtitle">Your own personal assistant</p>
          </div>
        </div>
        <button
          type="button"
          className="agent-chat-widget__minimize"
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize chat"
        >
          -
        </button>
      </header>

      <div className="agent-chat-widget__messages" ref={messagesRef}>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`agent-chat-widget__message-row agent-chat-widget__message-row--${message.role}`}
          >
            {message.role === 'assistant' ? (
              <img
                src={chatbotAvatar}
                alt=""
                className="agent-chat-widget__avatar agent-chat-widget__avatar--assistant"
              />
            ) : null}

            <p className={`agent-chat-widget__message agent-chat-widget__message--${message.role}`}>
              {message.text}
            </p>

            {message.role === 'user' ? (
              userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt=""
                  className="agent-chat-widget__avatar agent-chat-widget__avatar--user"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="agent-chat-widget__avatar agent-chat-widget__avatar--fallback">
                  {userInitial}
                </span>
              )
            ) : null}
          </article>
        ))}
        {sending ? (
          <article className="agent-chat-widget__message-row agent-chat-widget__message-row--assistant">
            <img
              src={chatbotAvatar}
              alt=""
              className="agent-chat-widget__avatar agent-chat-widget__avatar--assistant"
            />
            <p className="agent-chat-widget__message agent-chat-widget__message--assistant">Thinking...</p>
          </article>
        ) : null}
      </div>

      <form className="agent-chat-widget__composer" onSubmit={handleSend}>
        <input
          className="agent-chat-widget__composer-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything"
          aria-label="Chat message"
          disabled={sending}
        />
        <button
          type="submit"
          className="agent-chat-widget__composer-send"
          aria-label="Send message"
          disabled={sending}
        >
          <img src={sendIcon} alt="" />
        </button>
      </form>
    </section>
  )
}

export default AgentChatWidget
