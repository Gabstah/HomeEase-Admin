import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import FilterTabs from '../components/common/FilterTabs'
import { VERIFICATIONS } from '../data/verifications'

export default function Verification() {
  const [filterTab, setFilterTab] = useState('All')
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('approve') // 'approve' | 'reject' | 'success'
  const [rejectReason, setRejectReason] = useState('')

  const filtered = VERIFICATIONS.filter((row) => {
    if (filterTab === 'Clients') return row.type === 'client'
    if (filterTab === 'Workers') return row.type === 'worker'
    return true
  })

  const openApprove = (row) => {
    setSelected(row)
    setMode('approve')
    setRejectReason('')
  }

  const openReject = (row) => {
    setSelected(row)
    setMode('reject')
    setRejectReason('')
  }

  const closeModal = () => {
    setSelected(null)
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

  return (
    <>
      <PageHeader title="Verification Management" subtitle="Pending account verifications" />
      <div className="toolbar" style={{ marginBottom: '1rem' }}>
        <FilterTabs
          tabs={['All', 'Clients', 'Workers']}
          activeTab={filterTab}
          onTabChange={setFilterTab}
        />
      </div>
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Type</th>
                <th>Services / Reason</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.email}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{row.type}</td>
                  <td>{row.services}</td>
                  <td>{row.submitted}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/verification/detail/${row.id}`} className="action-btn view">
                        <i className="fas fa-eye" />
                      </Link>
                      {/* <button
                        type="button"
                        className="action-btn approve"
                        title="Approve"
                        onClick={() => openApprove(row)}
                      >
                        <i className="fas fa-check" />
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        title="Reject"
                        onClick={() => openReject(row)}
                      >
                        <i className="fas fa-times" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selected && mode !== 'success' && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
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
                <div className="value">{selected.name}</div>
              </div>
              <div className="detail-block">
                <label>Email</label>
                <div className="value">{selected.email}</div>
              </div>
              <div className="detail-block">
                <label>Type</label>
                <div className="value" style={{ textTransform: 'capitalize' }}>
                  {selected.type}
                </div>
              </div>
              <div className="detail-block">
                <label>Services / Reason</label>
                <div className="value">{selected.services}</div>
              </div>
            </div>

            {mode === 'reject' && (
              <form onSubmit={handleConfirm}>
                <div className="form-field">
                  <label htmlFor="reject-reason">Rejection Reason</label>
                  <textarea
                    id="reject-reason"
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
                    }}
                    required
                  />
                </div>
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeModal}
                  >
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
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConfirm}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selected && mode === 'success' && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="modal-title">Verification Approved</h2>
            <p className="modal-body">
              The verification for <strong>{selected.name}</strong> has been approved successfully.
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
