import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type TeamStatus = {
  id: string
  name: string
  status: 'inprogress' | 'done' | 'onhold' | 'blocked' | 'idle' | 'absent'
  task: string
  jira_ticket: string
  eta: string
  updated_at: string
}
