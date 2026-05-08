import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'

export const revalidate = 0

export default async function Home() {
  const { data } = await supabase
    .from('team_status')
    .select('*')
    .order('name')

  return <Dashboard initialData={data ?? []} />
}
