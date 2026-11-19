// Confirmation dialog. With no `message` it is the "send reminder email"
// dialog and shows which saved meeting the email will announce.
export default function ConfirmModal({
  isOpen, count, meeting, onConfirm, onCancel, sending,
  title, message, confirmLabel,
}) {
  if (!isOpen) return null

  const isReminder = !message
  const members = `${count} ${count === 1 ? 'member' : 'members'}`

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <h2 className="modal-title" id="modal-title">
          {title || (isReminder ? 'Send reminder email?' : 'Are you sure?')}
        </h2>
        {isReminder ? (
          <>
            <p className="modal-body" style={{ marginBottom: '12px' }}>
              You're about to send a reminder to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{members}</strong>.
              This cannot be undone.
            </p>
            {meeting ? (
              <p className="modal-body">
                The email will announce this meeting:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {meeting.event_date} · {meeting.event_time} · {meeting.location}
                </strong>
                . If that is not the next meeting, cancel and update it in the Meetings tab first.
              </p>
            ) : (
              <p className="modal-body">
                No meeting is saved yet. Add the next meeting in the Meetings tab before sending.
              </p>
            )}
          </>
        ) : (
          <p className="modal-body">{message}</p>
        )}
        <div className="modal-actions">
          <button className="admin-btn" onClick={onCancel} disabled={sending}>
            Cancel
          </button>
          <button
            className="submit-btn modal-confirm-btn"
            onClick={onConfirm}
            disabled={sending || (isReminder && !meeting)}
          >
            {sending ? (
              <span className="btn-loading">
                <span className="spinner" aria-hidden="true" />
                Working…
              </span>
            ) : (confirmLabel || `Send to ${members}`)}
          </button>
        </div>
      </div>
    </div>
  )
}
