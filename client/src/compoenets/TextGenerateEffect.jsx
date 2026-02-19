import './TextGenerateEffect.css'

function TextGenerateEffect({
  words,
  className = '',
  filter = true,
  duration = 0.5,
  stagger = 0.18,
}) {
  const wordsArray = words.split(' ').filter(Boolean)

  return (
    <span className={`text-generate ${className}`.trim()}>
      {wordsArray.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className={`text-generate__word ${filter ? 'text-generate__word--blur' : ''}`}
          style={{
            animationDelay: `${idx * stagger}s`,
            animationDuration: `${duration}s`,
          }}
        >
          {word}
          {idx < wordsArray.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </span>
  )
}

export default TextGenerateEffect
