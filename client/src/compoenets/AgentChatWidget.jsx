import { useState } from 'react'
import chatbotAvatar from '../assets/chatbot.jpg'
import sendIcon from '../assets/send.png'
import { useAuth } from '../context/AuthProvider'
import './AgentChatWidget.css'

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
  const { user } = useAuth()
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const userEmail = user?.email || ''
  const userInitial = userEmail.trim()?.[0]?.toUpperCase() || 'U'

  function handleSend(event) {
    event.preventDefault()
    const next = input.trim()
    if (!next) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: next,
    }
    const botMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Demo mode: backend not connected yet.',
    }

    setMessages((previous) => [...previous, userMessage, botMessage])
    setInput('')
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

      <div className="agent-chat-widget__messages">
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
      </div>

      <form className="agent-chat-widget__composer" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message..."
          aria-label="Chat message"
        />
        <button type="submit" className="agent-chat-widget__send" aria-label="Send message">
          <img src={sendIcon} alt="" />
        </button>
      </form>
    </section>
  )
}

export default AgentChatWidget
