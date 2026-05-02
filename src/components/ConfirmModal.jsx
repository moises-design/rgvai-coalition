export default function ConfirmModal({ isOpen, count, onConfirm, onCancel, sending }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <h2 className="modal-title" id="modal-title">Send reminder email?</h2>
        <p className="modal-body">
          You're about to send a reminder to{' '}
          <strong style={{ color: 'var(--cyan)' }}>{count} {count === 1 ? 'member' : 'members'}</strong>.
          This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="admin-btn" onClick={onCancel} disabled={sending}>
            Cancel
          </button>
          <button className="submit-btn modal-confirm-btn" onClick={onConfirm} disabled={sending}>
            {sending ? (
              <span className="btn-loading">
                <span className="spinner" aria-hidden="true" />
                Sending…
              </span>
            ) : `Send to ${count} ${count === 1 ? 'member' : 'members'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
