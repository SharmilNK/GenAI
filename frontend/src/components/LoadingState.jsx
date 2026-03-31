const styles = {
  wrapper: {
    maxWidth: 700,
    margin: '0 auto',
    animation: 'fadeUp 0.3s ease both',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0.9rem 1.25rem',
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem',
    color: 'var(--accent-light)',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(196,181,253,0.3)',
    borderTopColor: 'var(--accent-light)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  skeletonCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  skeletonImg: {
    height: 200,
    background: 'linear-gradient(90deg, #16162a 25%, #1e1e38 50%, #16162a 75%)',
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.4s infinite linear',
  },
  skeletonBody: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  skeletonLine: (w) => ({
    height: 12,
    borderRadius: 6,
    width: w,
    background: 'linear-gradient(90deg, #16162a 25%, #1e1e38 50%, #16162a 75%)',
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.4s infinite linear',
  }),
}

export default function LoadingState({ message }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.statusBar}>
        <div style={styles.spinner} />
        {message || 'Generating your campaign…'}
      </div>
      <div style={styles.grid}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={styles.skeletonCard}>
            <div style={styles.skeletonImg} />
            <div style={styles.skeletonBody}>
              <div style={styles.skeletonLine('60%')} />
              <div style={styles.skeletonLine('80%')} />
              <div style={styles.skeletonLine('40%')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
