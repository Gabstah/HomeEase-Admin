import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import { getVerificationById } from '../data/verifications'

export default function VerificationDetail() {
  const { id } = useParams()
  const verification = useMemo(() => getVerificationById(id), [id])

  const [mode, setMode] = useState(null) // 'approve' | 'reject' | 'success' | null
  const [rejectReason, setRejectReason] = useState('')

  const openApprove = () => {
    setMode('approve')
    setRejectReason('')
  }

  const openReject = () => {
    setMode('reject')
    setRejectReason('')
  }

  const closeModal = () => {
    setMode(null)
    setRejectReason('')
  }

  const handleConfirm = (e) => {
    e?.preventDefault()
    if (mode === 'approve') {
      setMode('success')
    } else {
      // reject path - just close for now
      closeModal()
    }
  }

  if (!verification) {
    return <Navigate to="/verification" replace />
  }

  const details = [
    { label: 'Applicant', value: verification.name },
    { label: 'Email', value: verification.email },
    { label: 'Type', value: verification.type },
    { label: 'Submitted', value: verification.submitted },
    { label: 'Document Type', value: verification.documentType },
    { label: 'Services / Reason', value: verification.services },
  ]

  return (
    <>
      <PageHeader
        title="Verification Detail Review"
        subtitle="Review documents and approve or reject"
        actions={<Link to="/verification" className="btn btn-outline">Back to Pending</Link>}
      />
      <div className="detail-grid">
        {details.map(({ label, value }) => (
          <div key={label} className="detail-block">
            <label>{label}</label>
            <div className="value" style={label === 'Type' ? { textTransform: 'capitalize' } : undefined}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <SectionCard title="Uploaded Documents">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(verification.documents || []).map((doc) => (
            <span key={doc} className="badge badge-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {doc}
            </span>
          ))}
        </div>
        <div className="chart-placeholder" style={{ height: 120, marginTop: '1rem' }}>
          Document preview placeholder
        </div>
      </SectionCard>
      <div className="cta-buttons">
        <button type="button" className="btn btn-success" onClick={openApprove}>
          Approve Verification
        </button>
        <button type="button" className="btn btn-danger" onClick={openReject}>
          Reject Verification
        </button>
      </div>

      {mode && mode !== 'success' && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="modal-title">
              {mode === 'approve' ? 'Approve Verification' : 'Reject Verification'}
            </h2>
            <p className="modal-body">
              {mode === 'approve'
                ? 'Are you sure you want to approve this account verification?'
                : 'Please provide a reason why this verification is being rejected.'}
            </p>

            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Applicant</label>
                <div className="value">{verification.name}</div>
              </div>
              <div className="detail-block">
                <label>Email</label>
                <div className="value">{verification.email}</div>
              </div>
              <div className="detail-block">
                <label>Type</label>
                <div className="value" style={{ textTransform: 'capitalize' }}>
                  {verification.type}
                </div>
              </div>
              <div className="detail-block">
                <label>Services / Reason</label>
                <div className="value">{verification.services}</div>
              </div>
            </div>

            {mode === 'reject' && (
              <form onSubmit={handleConfirm}>
                <div className="form-field">
                  <label htmlFor="reject-reason-detail">Rejection Reason</label>
                  <textarea
                    id="reject-reason-detail"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this verification is not approved..."
                    style={{
                      resize: 'vertical',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      fontSize: '0.9375rem',
                      width: '100%',
                    }}
                    required
                  />
                </div>
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Confirm Reject
                  </button>
                </div>
              </form>
            )}

            {mode === 'approve' && (
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleConfirm}>
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'success' && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="modal-title">Verification Approved</h2>
            <p className="modal-body">
              The verification for <strong>{verification.name}</strong> has been approved successfully.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
