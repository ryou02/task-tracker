import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function EncryptedText({
  text,
  encryptedClassName = '',
  revealedClassName = '',
  revealDelayMs = 50,
  startDelayMs = 0,
}) {
  const [displayText, setDisplayText] = useState(text)
  const [isDone, setIsDone] = useState(false)
  const frameRef = useRef(0)
  const startTimeoutRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    setIsDone(false)
    frameRef.current = 0

    startTimeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        frameRef.current += 1

        const revealedCount = Math.min(text.length, Math.floor(frameRef.current / 2))
        const next = text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' '
            if (idx < revealedCount) return char
            return randomChar()
          })
          .join('')

        setDisplayText(next)

        if (revealedCount >= text.length) {
          setDisplayText(text)
          setIsDone(true)
          window.clearInterval(intervalRef.current)
        }
      }, revealDelayMs)
    }, startDelayMs)

    return () => {
      if (startTimeoutRef.current) window.clearTimeout(startTimeoutRef.current)
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [text, revealDelayMs, startDelayMs])

  return (
    <span className={isDone ? revealedClassName : encryptedClassName} aria-label={text}>
      {displayText}
    </span>
  )
}

export default EncryptedText
