import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function getJwtRole(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload))
    return typeof decoded?.role === 'string' ? decoded.role : null
  } catch {
    return null
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

const jwtRole = supabaseAnonKey ? getJwtRole(supabaseAnonKey) : null
if (jwtRole === 'service_role') {
  throw new Error(
    'Unsafe Supabase key detected in client env: service_role key must never be exposed in frontend code.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'public-anon-key',
)
