import { useState } from 'react'
import PromptForm from './components/PromptForm'
import CampaignDisplay from './components/CampaignDisplay'
import LoadingState from './components/LoadingState'

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'rgba(17,17,32,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 2rem',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    fontSize: '1.15rem',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(124,58,237,0.2)',
    color: 'var(--accent-light)',
    border: '1px solid var(--border-accent)',
    letterSpacing: '0.05em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  settingsBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    padding: '4px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  settingsPanel: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    padding: '0.75rem 2rem',
  },
  settingsPanelInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  settingsLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  settingsInput: {
    flex: 1,
    minWidth: 260,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    padding: '5px 10px',
    outline: 'none',
  },
  settingsHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  main: {
    flex: 1,
    padding: '3rem 2rem 4rem',
  },
  mainInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2.5rem',
    animation: 'fadeUp 0.5s ease both',
  },
  heroLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--accent-light)',
    marginBottom: '0.75rem',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    marginBottom: '0.75rem',
    background: 'linear-gradient(135deg, #f1f5f9 30%, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    maxWidth: 520,
    margin: '0 auto',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '0.9rem 1.25rem',
    color: '#fca5a5',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.9rem',
  },
}

const DEFAULT_API = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [phase, setPhase]       = useState('idle')   // idle | loading | result
  const [campaign, setCampaign] = useState(null)
  const [error, setError]       = useState(null)
  const [progress, setProgress] = useState('')
  const [apiUrl, setApiUrl]     = useState(DEFAULT_API)
  const [showSettings, setShowSettings] = useState(false)

  function endpoint(path) {
    const base = apiUrl.replace(/\/$/, '')
    return base ? `${base}${path}` : path
  }

  async function handleGenerate({ prompt, product }) {
    setPhase('loading')
    setError(null)
    setCampaign(null)
    setProgress('Drafting campaign concept...')

    try {
      const res = await fetch(endpoint('/api/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, product }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Server error ${res.status}`)
      }

      // stream progress messages while waiting
      const reader = res.body?.getReader()
      let raw = ''

      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          raw += decoder.decode(value, { stream: true })
          // pick up progress lines prefixed with "data:"
          const lines = raw.split('\n')
          for (const line of lines) {
            if (line.startsWith('data:progress:')) {
              setProgress(line.replace('data:progress:', '').trim())
            }
          }
        }
        // last chunk is the JSON payload after the sentinel
        const jsonStart = raw.lastIndexOf('\ndata:result:')
        if (jsonStart !== -1) {
          const jsonStr = raw.slice(jsonStart + '\ndata:result:'.length).trim()
          setCampaign(JSON.parse(jsonStr))
        } else {
          // fallback: treat whole body as JSON
          setCampaign(JSON.parse(raw))
        }
      } else {
        const data = await res.json()
        setCampaign(data)
      }

      setPhase('result')
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  function handleReset() {
    setPhase('idle')
    setCampaign(null)
    setError(null)
  }

  return (
    <div style={styles.app}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            AdCraft AI
          </div>
          <div style={styles.headerRight}>
            <span style={styles.badge}>Mini Hackathon #3</span>
            <button
              style={styles.settingsBtn}
              onClick={() => setShowSettings(s => !s)}
              title="Configure backend URL"
            >
              ⚙ Backend
            </button>
          </div>
        </div>
      </header>

      {/* ── Settings panel ── */}
      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.settingsPanelInner}>
            <span style={styles.settingsLabel}>Backend URL</span>
            <input
              style={styles.settingsInput}
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="https://xxxx-xx-xx-xx.ngrok-free.app  (leave blank for local dev)"
              spellCheck={false}
            />
            <span style={styles.settingsHint}>
              Paste your ngrok URL from Colab
            </span>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main style={styles.main}>
        <div style={styles.mainInner}>

          {/* Hero */}
          <div style={styles.hero}>
            <div style={styles.heroLabel}>
              <span>✦</span> Product-in-Context Generator
            </div>
            <h1 style={styles.heroTitle}>
              One prompt.<br />A full ad campaign.
            </h1>
            <p style={styles.heroSub}>
              Describe your campaign and watch a fine-tuned diffusion model
              place your product into compelling advertising scenes — with
              AI-generated copy.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form (always visible unless showing results) */}
          {phase !== 'result' && (
            <PromptForm onGenerate={handleGenerate} loading={phase === 'loading'} />
          )}

          {/* Loading */}
          {phase === 'loading' && <LoadingState message={progress} />}

          {/* Result */}
          {phase === 'result' && campaign && (
            <CampaignDisplay campaign={campaign} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  )
}
