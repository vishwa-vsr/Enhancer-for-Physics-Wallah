import { activeView } from '../store';

export const SettingsView = () => {
  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '60px auto',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--accent-dim)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          width="28"
          height="28"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>

      <h2
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: '0 0 8px 0',
        }}
      >
        Settings Placeholder
      </h2>
      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          margin: '0 0 24px 0',
        }}
      >
        We have kept settings empty for now as requested. We will add export/import, sync, and
        custom planner preferences here later!
      </p>

      <button
        onClick={() => {
          activeView.value = { type: 'today' };
        }}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-primary)',
          color: '#ffffff',
          border: 'none',
          fontSize: '13.5px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        ← Back to Study Tasks
      </button>
    </div>
  );
};
