import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SectionCard from '../components/common/SectionCard'
import Badge from '../components/common/Badge'

const SUB_NAV = [
  { to: '/bookings', label: 'All Bookings' },
  { to: '/bookings/dispute', label: 'Booking Dispute' },
]

const DISPUTES = [
  {
    id: '#D01',
    booking: '#B198',
    raisedBy: 'Maria Santos',
    reason: 'Service not completed',
    status: 'Open',
    details: {
      service: 'Cleaning',
      worker: 'Ana Reyes',
      amount: '₱350',
      payment: 'GCash',
      notes: 'Client reports the worker did not arrive.',
      createdAt: 'Mar 1, 2025 10:15 AM',
    },
  },
  {
    id: '#D02',
    booking: '#B199',
    raisedBy: 'Jose Marie',
    reason: 'Payment issue / refund request',
    status: 'Open',
    details: {
      service: 'Plumbing',
      worker: 'Juan Dela Cruz',
      amount: '₱450',
      payment: 'Card',
      notes: 'Client claims they were charged but service was cancelled.',
      createdAt: 'Mar 2, 2025 09:40 AM',
    },
  },
]

export default function BookingDispute() {
  const [disputes, setDisputes] = useState(DISPUTES)
  const [selectedId, setSelectedId] = useState(null)

  const selected = useMemo(() => disputes.find((d) => d.id === selectedId) || null, [disputes, selectedId])

  const closeModal = () => setSelectedId(null)

  const updateDispute = (id, patch) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  const handleCancelBooking = () => {
    if (!selected) return
    updateDispute(selected.id, { status: 'Booking Cancelled' })
  }

  const handleRefundPayment = () => {
    if (!selected) return
    updateDispute(selected.id, { status: 'Refund Initiated' })
  }

  const handleResolve = () => {
    if (!selected) return
    updateDispute(selected.id, { status: 'Resolved' })
  }

  const getBadgeVariant = (status) => {
    if (status === 'Resolved') return 'approved'
    if (status === 'Open' || status === 'Pending') return 'pending'
    return 'active'
  }

  return (
    <>
      <PageHeader
        title="Booking Dispute"
        subtitle="Resolve booking disputes"
        actions={<Link to="/bookings" className="btn btn-outline">Back</Link>}
      />
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Dispute ID</th><th>Booking</th><th>Raised By</th><th>Reason</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.booking}</td>
                  <td>{d.raisedBy}</td>
                  <td>{d.reason}</td>
                  <td><Badge variant={getBadgeVariant(d.status)}>{d.status}</Badge></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                      onClick={() => setSelectedId(d.id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SubNav items={SUB_NAV} />

      {selected && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="modal-title">Review Dispute {selected.id}</h2>
            <p className="modal-body" style={{ marginBottom: '0.75rem' }}>
              <strong>Booking:</strong> {selected.booking} &nbsp;·&nbsp; <strong>Status:</strong>{' '}
              <Badge variant={getBadgeVariant(selected.status)}>{selected.status}</Badge>
            </p>
            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Raised By</label>
                <div className="value">{selected.raisedBy}</div>
              </div>
              <div className="detail-block">
                <label>Reason</label>
                <div className="value">{selected.reason}</div>
              </div>
              <div className="detail-block">
                <label>Worker</label>
                <div className="value">{selected.details?.worker}</div>
              </div>
              <div className="detail-block">
                <label>Service</label>
                <div className="value">{selected.details?.service}</div>
              </div>
              <div className="detail-block">
                <label>Amount</label>
                <div className="value">{selected.details?.amount}</div>
              </div>
              <div className="detail-block">
                <label>Payment</label>
                <div className="value">{selected.details?.payment}</div>
              </div>
              <div className="detail-block" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <div className="value">{selected.details?.notes}</div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-outline" onClick={closeModal}>
                Close
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCancelBooking}>
                  Cancel Booking
                </button>
                <button type="button" className="btn btn-purple" onClick={handleRefundPayment}>
                  Refund Payment
                </button>
                <button type="button" className="btn btn-success" onClick={handleResolve}>
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
