import AdCard from './AdCard'

const styles = {
  wrapper: {
    animation: 'fadeUp 0.4s ease both',
  },
  header: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.75rem 2rem',
    marginBottom: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  campaignLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent-light)',
    marginBottom: '0.3rem',
  },
  campaignName: {
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.5rem 1rem',
    borderRadius: 8,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontFamily: 'inherit',
    fontSize: '0.83rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
    flexShrink: 0,
  },
  tagline: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: 'var(--accent-light)',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
  },
  pill: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.78rem',
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 20,
    background: color === 'green'
      ? 'rgba(16,185,129,0.1)'
      : color === 'yellow'
      ? 'rgba(245,158,11,0.1)'
      : 'rgba(124,58,237,0.1)',
    border: `1px solid ${
      color === 'green'  ? 'rgba(16,185,129,0.3)'  :
      color === 'yellow' ? 'rgba(245,158,11,0.3)'  :
                           'rgba(124,58,237,0.3)'}`,
    color: color === 'green'  ? '#6ee7b7' :
           color === 'yellow' ? '#fcd34d' :
                                'var(--accent-light)',
  }),
  concept: {
    marginTop: '0.75rem',
    padding: '0.85rem 1rem',
    background: 'rgba(0,0,0,0.25)',
    borderRadius: 'var(--radius-md)',
    borderLeft: '3px solid var(--accent)',
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
  },
}

export default function CampaignDisplay({ campaign, onReset }) {
  const {
    name,
    tagline,
    concept,
    target_audience,
    tone,
    ads = [],
  } = campaign

  return (
    <div style={styles.wrapper}>
      {/* ── Campaign header ── */}
      <div style={styles.header}>
        <div style={styles.headerGlow} />

        <div style={styles.topRow}>
          <div>
            <div style={styles.campaignLabel}>Campaign</div>
            <div style={styles.campaignName}>{name}</div>
          </div>
          <button
            style={styles.resetBtn}
            onClick={onReset}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            ← New Campaign
          </button>
        </div>

        {tagline && <div style={styles.tagline}>"{tagline}"</div>}

        <div style={styles.metaRow}>
          {target_audience && (
            <span style={styles.pill('purple')}>👥 {target_audience}</span>
          )}
          {tone && (
            <span style={styles.pill('yellow')}>🎯 {tone}</span>
          )}
          <span style={styles.pill('green')}>✦ {ads.length} Ad{ads.length !== 1 ? 's' : ''} Generated</span>
        </div>

        {concept && (
          <div style={styles.concept}>{concept}</div>
        )}
      </div>

      {/* ── Ad grid ── */}
      {ads.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Generated Ads</div>
          <div style={styles.grid}>
            {ads.map((ad, i) => (
              <AdCard key={i} ad={ad} index={i} />
            ))}
          </div>
        </>
      )}

      <div style={styles.footer}>
        Images generated by Stable Diffusion v1.5 + LoRA fine-tuned on product images · Copy by Claude
      </div>
    </div>
  )
}
