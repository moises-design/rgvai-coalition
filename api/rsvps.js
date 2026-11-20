import { createClient } from '@supabase/supabase-js'
import { ADMIN, SUPER, requireAdmin } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const COLUMNS = 'id, name, email, phone, role, ai_primary, ai_secondary, created_at'

// The member list, for the admin and super admin dashboards. Members cannot
// be read from the browser directly, so both dashboards read them here.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!await requireAdmin(supabase, req, res, 'x-admin-token', [ADMIN(), SUPER()])) return

  let { data, error } = await supabase
    .from('rsvps').select(`${COLUMNS}, email_opt_out`).order('created_at', { ascending: false })
  if (error?.code === '42703') {
    // The opt-out column is not in the database yet.
    ;({ data, error } = await supabase.from('rsvps').select(COLUMNS).order('created_at', { ascending: false }))
  }

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}
