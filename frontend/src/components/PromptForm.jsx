import { useState } from 'react'

const EXAMPLES = [
  'Summer hydration campaign targeting young athletes',
  'Eco-friendly lifestyle campaign for outdoor hikers',
  'Back-to-school energy and focus campaign for students',
  'Holiday gifting campaign, premium wellness angle',
]

const styles = {
  wrapper: {
    maxWidth: 700,
    margin: '0 auto 2.5rem',
    animation: 'fadeUp 0.4s ease 0.1s both',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    boxShadow: 'var(--shadow-card)',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '0.6rem',
  },
  textarea: {
    width: '100%',
    minHeight: 110,
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    lineHeight: 1.6,
    padding: '0.85rem 1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 180,
  },
  input: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    padding: '0.7rem 1rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0.75rem 1.75rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s, transform 0.15s',
    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
  },
  btnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
    transform: 'none',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  examples: {
    marginTop: '1.25rem',
  },
  examplesLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    marginBottom: '0.5rem',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  chip: {
    fontSize: '0.78rem',
    padding: '4px 10px',
    borderRadius: 20,
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid var(--border-accent)',
    color: 'var(--accent-light)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
}

export default function PromptForm({ onGenerate, loading }) {
  const [prompt, setPrompt]   = useState('')
  const [product, setProduct] = useState('Pelo Water Bottle')

  function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    onGenerate({ prompt: prompt.trim(), product: product.trim() })
  }

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <label style={styles.label}>Campaign Brief</label>
        <textarea
          style={styles.textarea}
          placeholder='e.g. "Summer hydration campaign targeting young athletes"'
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={loading}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, marginTop: 0 }}>Product</label>
            <input
              style={styles.input}
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="Product name"
              disabled={loading}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              style={loading || !prompt.trim()
                ? { ...styles.btn, ...styles.btnDisabled }
                : styles.btn}
              disabled={loading || !prompt.trim()}
            >
              {loading
                ? <><div style={styles.spinner} /> Generating…</>
                : <><span>⚡</span> Generate Campaign</>}
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div style={styles.examples}>
          <div style={styles.examplesLabel}>Try an example:</div>
          <div style={styles.chips}>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                type="button"
                style={styles.chip}
                onClick={() => setPrompt(ex)}
                disabled={loading}
                onMouseEnter={e => (e.target.style.background = 'rgba(124,58,237,0.22)')}
                onMouseLeave={e => (e.target.style.background = 'rgba(124,58,237,0.12)')}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
