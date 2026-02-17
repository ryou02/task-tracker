import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { FloatingNav } from '../compoenets/FloatingNav.jsx'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fromPath = location.state?.from?.pathname || '/dashboard'

  if (user) {
    return <Navigate to={fromPath} replace />
  }

  async function handleEmailLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    navigate(fromPath, { replace: true })
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    setMessage('')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      setError('Enter an email and password first.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setMessage('Account created. Check your email to confirm, then sign in.')
    setLoading(false)
  }

  return (
    <main className="login-page">
      <FloatingNav navItems={[{ name: 'Home', link: '/' }]} />

      <section className="login-card" aria-label="Login form">
        <p className="login-eyebrow">Authentication</p>
        <h1 className="login-title">
          Sign in
          <span className="login-title__accent"> securely</span>
        </h1>
        <p className="login-subtitle">
          Continue to your dashboard, deadlines, and daily task tracker.
        </p>

        <button type="button" className="login-google" onClick={handleGoogleLogin} disabled={loading}>
          Continue with Google
        </button>

        <div className="login-divider" role="separator" aria-label="or">
          <span>or</span>
        </div>

        <form className="login-form" onSubmit={handleEmailLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            required
          />

          {error ? <p className="login-feedback login-feedback--error">{error}</p> : null}
          {message ? <p className="login-feedback login-feedback--ok">{message}</p> : null}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In'}
          </button>

          <button type="button" className="login-create" onClick={handleSignUp} disabled={loading}>
            Create account
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
