'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, TeamStatus } from '@/lib/supabase'

const NAMES = [
  'Vijayandiran S','Swathi','Ummu Halima','Fahad','Faaiz','Riaz',
  'Ismail','Hashim','Javith','Ajay','Sangeetha','Raj','Gokul'
]

const STATUS_OPTIONS = [
  { id: 'inprogress', label: 'In Progress',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'done',       label: 'Done',          color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'onhold',     label: 'On Hold',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'blocked',    label: 'Blocked',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  { id: 'idle',       label: 'Available',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)'},
  { id: 'absent',     label: 'Absent',        color: '#64748b', bg: 'rgba(100,116,139,0.12)'},
] as const

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.id === status) ?? STATUS_OPTIONS[4]
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Not updated'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{
      background: '#1a2236', border: '1px solid #2a3a5c', borderRadius: 12,
      padding: '1rem', textAlign: 'center'
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
    </div>
  )
}

function EmployeeCard({ member }: { member: TeamStatus }) {
  const s = getStatusStyle(member.status)
  return (
    <div className="fade-in" style={{
      background: '#1a2236', border: '1px solid #2a3a5c', borderRadius: 12,
      padding: '14px', position: 'relative', transition: 'transform .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '12px 12px 0 0' }} />
      <div style={{
        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 12, fontWeight: 700,
        background: s.bg, color: s.color, marginBottom: 8, marginTop: 4
      }}>
        {getInitials(member.name)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{member.name}</div>
      <span style={{
        fontSize: 11, padding: '3px 8px', borderRadius: 20,
        background: s.bg, color: s.color, fontWeight: 600, display: 'inline-block'
      }}>
        {s.label}
      </span>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4, minHeight: 14 }}>
        {member.task || <span style={{ color: '#475569', fontStyle: 'italic' }}>No update yet</span>}
      </div>
      {member.jira_ticket && (
        <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4 }}>
          🎫 {member.jira_ticket}{member.eta ? ` · ETA ${member.eta}` : ''}
        </div>
      )}
      <div className="mono" style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
        {timeAgo(member.updated_at)}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard({ initialData }: { initialData: TeamStatus[] }) {
  const [tab, setTab] = useState<'dashboard' | 'form' | 'jira'>('dashboard')
  const [members, setMembers] = useState<TeamStatus[]>(initialData)
  const [clock, setClock] = useState('')
  const [jiraFilter, setJiraFilter] = useState('all')

  // Form state
  const [fName, setFName] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fTask, setFTask] = useState('')
  const [fJira, setFJira] = useState('')
  const [fEta, setFEta] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('team_status_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'team_status' }, payload => {
        setMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new as TeamStatus : m))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const submitStatus = useCallback(async () => {
    if (!fName) { setError('Please select your name.'); return }
    if (!fStatus) { setError('Please select a status.'); return }
    setError(''); setSaving(true)
    const { error: err } = await supabase
      .from('team_status')
      .update({ status: fStatus, task: fTask, jira_ticket: fJira, eta: fEta, updated_at: new Date().toISOString() })
      .eq('name', fName)
    setSaving(false)
    if (err) { setError('Failed to save. Check your Supabase config.'); return }
    setSuccess(true)
    setFName(''); setFStatus(''); setFTask(''); setFJira(''); setFEta('')
    setTimeout(() => setSuccess(false), 4000)
  }, [fName, fStatus, fTask, fJira, fEta])

  // Stats
  const statActive = members.filter(m => m.status === 'inprogress').length
  const statHold   = members.filter(m => m.status === 'onhold' || m.status === 'blocked').length
  const statToday  = members.filter(m => isToday(m.updated_at)).length

  // Jira filtered rows
  const jiraRows = members.filter(m => {
    if (jiraFilter === 'all') return m.updated_at
    return getStatusStyle(m.status).label === jiraFilter && m.updated_at
  })

  const tabStyle = (t: string) => ({
    padding: '1rem 1.5rem', cursor: 'pointer', fontSize: 14, fontWeight: 500,
    color: tab === t ? '#3b82f6' : '#64748b',
    borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
    background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
    fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s', whiteSpace: 'nowrap' as const
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', background: '#111827', borderBottom: '1px solid #2a3a5c', padding: '0 1.5rem', overflowX: 'auto' }}>
        <button style={tabStyle('dashboard')} onClick={() => setTab('dashboard')}>📺 Live Dashboard</button>
        <button style={tabStyle('form')} onClick={() => setTab('form')}>✏️ Update My Status</button>
        <button style={tabStyle('jira')} onClick={() => setTab('jira')}>📋 Jira Tracker</button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.5px' }}>Team Status Board</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                LIVE
              </div>
              <div className="mono" style={{ fontSize: 13, color: '#64748b', background: '#1a2236', border: '1px solid #2a3a5c', borderRadius: 8, padding: '6px 12px' }}>{clock}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
            <StatCard value={NAMES.length} label="Total Members"    color="#3b82f6" />
            <StatCard value={statActive}   label="In Progress"      color="#10b981" />
            <StatCard value={statHold}     label="On Hold / Blocked" color="#f59e0b" />
            <StatCard value={statToday}    label="Updated Today"    color="#a78bfa" />
          </div>

          {/* Grid */}
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Team Members</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
            {members.map(m => <EmployeeCard key={m.id} member={m} />)}
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      {tab === 'form' && (
        <div style={{ padding: '1.5rem', maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div style={{ background: '#1a2236', border: '1px solid #2a3a5c', borderRadius: 16, padding: '2rem' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Update Your Status</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: '1.5rem' }}>Your update appears live on the dashboard instantly.</div>

            {/* Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Your Name</label>
              <select value={fName} onChange={e => setFName(e.target.value)} style={inputStyle}>
                <option value="">— Select your name —</option>
                {NAMES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Current Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {STATUS_OPTIONS.map(s => (
                  <div key={s.id}
                    onClick={() => setFStatus(s.id)}
                    style={{
                      background: fStatus === s.id ? s.bg : '#0d1526',
                      border: `1px solid ${fStatus === s.id ? s.color : '#2a3a5c'}`,
                      borderRadius: 8, padding: '10px 8px', cursor: 'pointer',
                      textAlign: 'center', fontSize: 12, fontWeight: 600,
                      color: fStatus === s.id ? s.color : '#64748b',
                      transition: 'all .2s'
                    }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, margin: '0 auto 6px' }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Task */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>What are you working on?</label>
              <textarea value={fTask} onChange={e => setFTask(e.target.value)}
                placeholder="e.g. Fixing login bug, reviewing PR #42, client call…"
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
            </div>

            {/* Jira + ETA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Jira Ticket (optional)</label>
                <input value={fJira} onChange={e => setFJira(e.target.value)} placeholder="e.g. PROJ-123" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>ETA / End Time</label>
                <input type="time" value={fEta} onChange={e => setFEta(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}

            <button onClick={submitStatus} disabled={saving} style={{
              width: '100%', padding: 12, borderRadius: 10, border: 'none',
              background: saving ? '#334155' : '#3b82f6', color: '#fff',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .2s'
            }}>
              {saving ? 'Saving…' : 'Submit Status Update'}
            </button>

            {success && (
              <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 10, padding: '12px 16px', color: '#10b981', fontSize: 13, fontWeight: 500, marginTop: '1rem' }}>
                ✅ Status updated! It's live on the dashboard now.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JIRA ── */}
      {tab === 'jira' && (
        <div style={{ padding: '1.5rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Filter:</span>
            {['all', 'In Progress', 'On Hold', 'Blocked', 'Done', 'Available'].map(f => (
              <button key={f} onClick={() => setJiraFilter(f)} style={{
                background: jiraFilter === f ? '#3b82f6' : '#1a2236',
                border: `1px solid ${jiraFilter === f ? '#3b82f6' : '#2a3a5c'}`,
                borderRadius: 8, color: jiraFilter === f ? '#fff' : '#64748b',
                padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s'
              }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {jiraRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: 14 }}>
              No entries yet. Team members can add details when updating their status.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Member','Jira Ticket','Task','Status','ETA','Updated'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #2a3a5c' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jiraRows.map(m => {
                    const s = getStatusStyle(m.status)
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #1a2236' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,34,54,.5)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {m.jira_ticket
                            ? <span className="mono" style={{ fontSize: 12, color: '#3b82f6' }}>{m.jira_ticket}</span>
                            : <span style={{ color: '#475569' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8', maxWidth: 200 }}>{m.task || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className="mono" style={{ fontSize: 12, color: '#64748b' }}>{m.eta || '—'}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#475569' }}>{timeAgo(m.updated_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d1526', border: '1px solid #2a3a5c',
  borderRadius: 8, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 14, padding: '10px 12px', outline: 'none'
}
