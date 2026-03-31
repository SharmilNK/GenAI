import { useState } from 'react'

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    cursor: 'default',
    animation: 'fadeUp 0.4s ease both',
  },
  imgWrapper: {
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  img: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.4s ease',
  },
  imgPlaceholder: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 8,
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  sceneBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: '0.04em',
  },
  downloadBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  body: {
    padding: '1.1rem 1.25rem 1.25rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  headline: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  bodyText: {
    fontSize: '0.83rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.55,
    flex: 1,
  },
  cta: {
    marginTop: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.5rem 1rem',
    borderRadius: 8,
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid var(--border-accent)',
    color: 'var(--accent-light)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s',
    alignSelf: 'flex-start',
  },
}

export default function AdCard({ ad, index }) {
  const [hovered, setHovered] = useState(false)

  const imgSrc = ad.image
    ? `data:image/png;base64,${ad.image}`
    : null

  function handleDownload() {
    if (!imgSrc) return
    const a = document.createElement('a')
    a.href = imgSrc
    a.download = `ad-${index + 1}-${ad.scene?.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  return (
    <div
      style={{
        ...styles.card,
        animationDelay: `${index * 0.08}s`,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 40px rgba(124,58,237,0.2)' : 'var(--shadow-card)',
        borderColor: hovered ? 'rgba(124,58,237,0.4)' : 'var(--border)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={styles.imgWrapper}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={ad.scene}
            style={{
              ...styles.img,
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={styles.imgPlaceholder}>
            <span style={{ fontSize: '2rem' }}>🖼</span>
            <span>Image generating…</span>
          </div>
        )}

        {ad.scene && (
          <div style={styles.sceneBadge}>{ad.scene}</div>
        )}

        {imgSrc && (
          <button
            style={{ ...styles.downloadBtn, opacity: hovered ? 1 : 0 }}
            onClick={handleDownload}
            title="Download image"
          >
            ↓
          </button>
        )}
      </div>

      {/* Copy */}
      <div style={styles.body}>
        <div style={styles.headline}>{ad.headline}</div>
        {ad.body_copy && (
          <div style={styles.bodyText}>{ad.body_copy}</div>
        )}
        {ad.cta && (
          <button
            style={styles.cta}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}
          >
            {ad.cta} →
          </button>
        )}
      </div>
    </div>
  )
}
