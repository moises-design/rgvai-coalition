import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const VALID_CATEGORIES = ['article', 'tool', 'video', 'other']

function isSuperAdmin(req) {
  return req.headers['x-superadmin-token'] === process.env.SUPER_ADMIN_PASSWORD
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (!isSuperAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { title, url, description, category } = req.body
    if (!title?.trim() || !url?.trim()) return res.status(400).json({ error: 'Title and URL are required' })
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' })
    const { data, error } = await supabase
      .from('resources')
      .insert([{ title: title.trim(), url: url.trim(), description: description?.trim() || null, category }])
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'DELETE') {
    if (!isSuperAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ deleted: id })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
