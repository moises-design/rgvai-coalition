import { createClient } from '@supabase/supabase-js'
import { clientIp, overLimit, recordHit } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_PER_HOUR = 5 // sign-ups accepted per network address, per hour
const clean = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)

// The "Join the coalition" form. Sign-ups go through here, not straight from
// the browser to the database, so they can be checked and limited.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const member = {
    name: clean(body.name, 120),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40) || null,
    ai_primary: clean(body.ai_primary, 60),
    ai_secondary: clean(body.ai_secondary, 60) || null,
  }
  if (!member.name) return res.status(400).json({ error: 'Full name is required.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (member.phone && !/^\+?[\d\s\-().]{7,}$/.test(member.phone)) {
    return res.status(400).json({ error: 'Enter a valid phone number.' })
  }
  if (!member.ai_primary) return res.status(400).json({ error: 'Please select your favorite AI tool.' })

  const ip = clientIp(req)
  if (await overLimit(supabase, 'join', ip, MAX_PER_HOUR, 3600)) {
    return res.status(429).json({ error: 'Too many sign-ups from this network. Please try again in an hour.' })
  }
  await recordHit(supabase, 'join', ip)

  const { error } = await supabase.from('rsvps').insert([member])
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'This email is already a member. Use Member login to get a new portal link.' })
  }
  if (error) {
    console.error('join: save failed', error.message)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
  return res.status(200).json({ ok: true })
}
