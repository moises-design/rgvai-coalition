import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function unauthorized(res) {
  return res.status(401).json({ error: 'Unauthorized' })
}

export default async function handler(req, res) {
  const token = req.headers['x-admin-token']
  if (!token || (token !== process.env.ADMIN_PASSWORD && token !== process.env.SUPER_ADMIN_PASSWORD)) return unauthorized(res)

  if (req.method === 'POST') {
    const { title, body } = req.body
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Title and body are required' })
    }
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ title: title.trim(), body: body.trim() }])
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ deleted: id })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
