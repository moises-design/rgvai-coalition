// Shared protection for the API routes: attempt limits, admin password
// checks and unsubscribe tokens. The leading underscore keeps Vercel from
// treating this file as a route.
import crypto from 'node:crypto'

const SITE = 'https://rgvaicoalition.com'

function secret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

// One-way hash, so the log never holds a real email or network address.
function hashKey(value) {
  return crypto.createHmac('sha256', secret()).update(String(value).toLowerCase()).digest('hex')
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0].trim()
  return first || req.socket?.remoteAddress || 'unknown'
}

// True when `key` already has `max` entries of this kind inside the window.
// If the log table is missing or unreachable the limit is skipped (and the
// error logged) so a database problem cannot lock everyone out.
export async function overLimit(supabase, kind, key, max, windowSeconds) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString()
  const { count, error } = await supabase
    .from('request_log')
    .select('id', { count: 'exact', head: true })
    .eq('kind', kind)
    .eq('key_hash', hashKey(key))
    .gte('created_at', since)
  if (error) {
    console.error('request_log: limit check skipped', error.message)
    return false
  }
  return (count || 0) >= max
}

export async function recordHit(supabase, kind, key) {
  const { error } = await supabase.from('request_log').insert([{ kind, key_hash: hashKey(key) }])
  if (error) {
    console.error('request_log: could not record', error.message)
    return
  }
  // Keep the log short-lived.
  const dayAgo = new Date(Date.now() - 24 * 3600000).toISOString()
  await supabase.from('request_log').delete().lt('created_at', dayAgo)
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

const ADMIN_FAILS = 8          // wrong passwords allowed...
const ADMIN_WINDOW = 15 * 60   // ...per network address, per 15 minutes

// Checks an admin password, counting wrong guesses per network address.
// Returns 'ok', 'bad' (wrong, and counted), 'limited' or 'none' (no password sent).
export async function checkPassword(supabase, req, supplied, passwords) {
  if (!supplied) return 'none'
  const ip = clientIp(req)
  if (await overLimit(supabase, 'admin_fail', ip, ADMIN_FAILS, ADMIN_WINDOW)) return 'limited'
  if (passwords.some(password => password && safeEqual(supplied, password))) return 'ok'
  await recordHit(supabase, 'admin_fail', ip)
  return 'bad'
}

// For routes that take the password in a header. Sends the refusal itself and
// returns false when the request may not continue.
export async function requireAdmin(supabase, req, res, header, passwords) {
  const status = await checkPassword(supabase, req, req.headers[header], passwords)
  if (status === 'ok') return true
  if (status === 'limited') {
    res.status(429).json({ error: 'Too many wrong passwords. Wait 15 minutes and try again.' })
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
  return false
}

export const ADMIN = () => process.env.ADMIN_PASSWORD
export const SUPER = () => process.env.SUPER_ADMIN_PASSWORD

// Unsubscribe links are signed, so nobody can opt another person out by
// guessing, and no token needs to be stored.
export function unsubscribeToken(email) {
  return crypto.createHmac('sha256', secret()).update(`unsubscribe:${String(email).trim().toLowerCase()}`).digest('hex').slice(0, 32)
}

export function validUnsubscribeToken(email, token) {
  return Boolean(email && token) && safeEqual(unsubscribeToken(email), token)
}

export function unsubscribeLinks(email) {
  const query = `e=${encodeURIComponent(String(email).trim().toLowerCase())}&t=${unsubscribeToken(email)}`
  return { page: `${SITE}/unsubscribe?${query}`, oneClick: `${SITE}/api/unsubscribe?${query}` }
}

// Headers that let mail apps show their own "Unsubscribe" button.
export function unsubscribeHeaders(email) {
  return {
    'List-Unsubscribe': `<${unsubscribeLinks(email).oneClick}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

// "Learn or teach" links in reminder emails are signed the same way, with
// their own token, so an answer from an email is tied to that member without
// a sign-in and the link cannot be used to unsubscribe anyone.
export function interestToken(email) {
  return crypto.createHmac('sha256', secret()).update(`interest:${String(email).trim().toLowerCase()}`).digest('hex').slice(0, 32)
}

export function validInterestToken(email, token) {
  return Boolean(email && token) && safeEqual(interestToken(email), token)
}

// Opens the board with one topic already picked. Nothing is saved until the
// person presses the button on the page, so a mail scanner that merely opens
// the link cannot answer for them.
export function interestLink(email, topicId) {
  const address = String(email).trim().toLowerCase()
  const topic = topicId ? `topic=${encodeURIComponent(topicId)}&` : ''
  return `${SITE}/learn?${topic}e=${encodeURIComponent(address)}&t=${interestToken(address)}`
}

// One-way key for a person's row on the board.
export function interestVoterKey(identity) {
  return hashKey(`interest:${identity}`)
}
