import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SectionCard from '../components/common/SectionCard'
import Badge from '../components/common/Badge'

const SUB_NAV = [
  { to: '/payments', label: 'All Transactions' },
  { to: '/payments/refunds', label: 'Refund Management' },
]

// In a real app this would come from your backend / disputes module.
const INITIAL_REFUNDS = [
  {
    id: '#R01',
    transaction: '#T301',
    booking: '#B198',
    client: 'Maria Santos',
    worker: 'Juan Dela Cruz',
    userAmount: 500,
    workerAmount: 450,
    platformFee: 50,
    reason: 'Booking dispute resolved in favor of client (worker no-show).',
    status: 'Pending', // Pending | Completed
  },
]

function formatPeso(amount) {
  return `₱${amount.toLocaleString()}`
}

export default function Refunds() {
  const [refunds, setRefunds] = useState(INITIAL_REFUNDS)
  const [selected, setSelected] = useState(null)

  const startProcess = (r) => {
    setSelected(r)
  }

  const closeModal = () => setSelected(null)

  const confirmRefund = () => {
    // In a real app, call your payments API here.
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === selected.id ? { ...r, status: 'Completed' } : r,
      ),
    )
    setSelected(null)
  }

  return (
    <>
      <PageHeader title="Refund Management" subtitle="Process and track refunds" />
      <SubNav items={SUB_NAV} />
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Transaction</th>
                <th>Booking</th>
                <th>Client</th>
                <th>Worker</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.transaction}</td>
                  <td>{r.booking}</td>
                  <td>{r.client}</td>
                  <td>{r.worker}</td>
                  <td>{formatPeso(r.userAmount)}</td>
                  <td>
                    <Badge variant={r.status === 'Completed' ? 'approved' : 'pending'}>
                      {r.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn.success"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                      disabled={r.status === 'Completed'}
                      onClick={() => startProcess(r)}
                    >
                      {r.status === 'Completed' ? 'Refunded' : 'Process'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selected && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="modal-title">Process Refund {selected.id}</h2>
            <p className="modal-body">
              This refund was requested for booking <strong>{selected.booking}</strong> on
              transaction <strong>{selected.transaction}</strong>.
            </p>
            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Client</label>
                <div className="value">{selected.client}</div>
              </div>
              <div className="detail-block">
                <label>Worker</label>
                <div className="value">{selected.worker}</div>
              </div>
              <div className="detail-block">
                <label>Client Paid</label>
                <div className="value">{formatPeso(selected.userAmount)}</div>
              </div>
              <div className="detail-block">
                <label>Worker Earnings</label>
                <div className="value">{formatPeso(selected.workerAmount)}</div>
              </div>
              <div className="detail-block">
                <label>Platform Commission</label>
                <div className="value">{formatPeso(selected.platformFee)}</div>
              </div>
              <div className="detail-block" style={{ gridColumn: '1 / -1' }}>
                <label>Refund Reason</label>
                <div className="value">{selected.reason}</div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmRefund}>
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
