import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SectionCard from '../components/common/SectionCard'

const SUB_NAV = [
  { to: '/reviews', label: 'All Reviews' },
  { to: '/reviews/flagged', label: 'Flagged Reviews' },
]

const INITIAL_FLAGGED = [
  {
    id: '#RV098',
    worker: 'Pedro Garcia',
    rating: '2.0',
    reason: 'Inappropriate content',
    reviewText: 'The worker used offensive language during the job. I felt very uncomfortable.',
    flaggedBy: 'Client',
    flaggedAt: 'Mar 1, 2025 09:30 AM',
    public: false,
    status: 'Public', // Flagged | Public | Hidden | Warned
  },
  {
    id: '#RV099',
    worker: 'Maria Santos',
    rating: '2.0',
    reason: 'Spam / Fake review',
    reviewText: 'This looks like spam and does not describe any real service.',
    flaggedBy: 'Worker',
    flaggedAt: 'Mar 2, 2025 10:15 AM',
    public: false,
    status: 'Public', // Flagged | Public | Hidden | Warned
  },
]

export default function ReviewsFlagged() {
  const [flagged, setFlagged] = useState(INITIAL_FLAGGED)
  const [selected, setSelected] = useState(null)

  const keepPublic = (id) => {
    // Keep review visible, clear flag
    setFlagged((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, public: true, status: 'Public' } : r,
      ),
    )
  }

  const hideReview = (id) => {
    // Hide from worker profile, keep in admin
    setFlagged((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, public: false, status: 'Hidden' } : r,
      ),
    )
  }

  const warnUser = (id) => {
    // Advanced: would also send email; here we just mark as Warned + Hidden
    setFlagged((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, public: false, status: 'Warned' } : r,
      ),
    )
  }

  return (
    <>
      <PageHeader title="Flagged Reviews" subtitle="Reviews reported by users" />
      <SubNav items={SUB_NAV} />
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Review</th>
                <th>Worker</th>
                <th>Rating</th>
                <th>Flag Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flagged.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.worker}</td>
                  <td>★ {r.rating}</td>
                  <td>{r.reason}</td>
                  <td>{r.status}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                      onClick={() => setSelected(r)}
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                      onClick={() => keepPublic(r.id)}
                      title="Keep Public (dismiss flag)"
                    >
                      Keep Public
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                      onClick={() => hideReview(r.id)}
                      title="Hide review from worker profile"
                    >
                      Hide Review
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={() => warnUser(r.id)}
                      title="Hide and warn user (simulated)"
                    >
                      Warn User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="modal-title">Flagged Review {selected.id}</h2>
            <p className="modal-body" style={{ marginBottom: '0.75rem' }}>
              This review was flagged as a potential issue. Review the details below before taking action.
            </p>

            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Worker</label>
                <div className="value">{selected.worker}</div>
              </div>
              <div className="detail-block">
                <label>Rating</label>
                <div className="value">★ {selected.rating}</div>
              </div>
              <div className="detail-block">
                <label>Current Status</label>
                <div className="value">{selected.status}</div>
              </div>
              <div className="detail-block">
                <label>Visibility</label>
                <div className="value">{selected.public ? 'Public (visible on profile)' : 'Hidden (admin only)'}</div>
              </div>
              <div className="detail-block">
                <label>Flagged By</label>
                <div className="value">{selected.flaggedBy}</div>
              </div>
              <div className="detail-block">
                <label>Flagged At</label>
                <div className="value">{selected.flaggedAt}</div>
              </div>
              <div className="detail-block" style={{ gridColumn: '1 / -1' }}>
                <label>Flag Reason</label>
                <div className="value">{selected.reason}</div>
              </div>
              <div className="detail-block" style={{ gridColumn: '1 / -1' }}>
                <label>Review Text</label>
                <div className="value">{selected.reviewText}</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
