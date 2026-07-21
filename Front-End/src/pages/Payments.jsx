import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'
import SectionCard from '../components/common/SectionCard'
import Pagination from '../components/common/Pagination'
import Badge from '../components/common/Badge'
import { TRANSACTIONS, formatPeso } from '../data/payments'

const SUB_NAV = [
  { to: '/payments', label: 'All Transactions' },
  { to: '/payments/refunds', label: 'Refund Management' },
]

// For demo purposes we hard-code a simple commission split (e.g. app keeps 15%).
const PLATFORM_RATE = 0.15

export default function Payments() {
  const [filterTab, setFilterTab] = useState('All')
  const [search, setSearch] = useState('')
  const [refundModal, setRefundModal] = useState(null) // transaction or null

  const filteredTransactions = useMemo(
    () =>
      TRANSACTIONS.filter((t) => {
        if (filterTab === 'Completed' && t.status !== 'Completed') return false
        if (filterTab === 'Pending' && t.status !== 'Pending') return false
        if (filterTab === 'Failed' && t.status !== 'Failed') return false
        if (!search.trim()) return true
        const q = search.trim().toLowerCase()
        return (
          t.id.toLowerCase().includes(q) ||
          t.booking.toLowerCase().includes(q) ||
          t.user.toLowerCase().includes(q) ||
          t.worker.toLowerCase().includes(q)
        )
      }),
    [filterTab, search],
  )

  const totals = useMemo(() => {
    const completed = TRANSACTIONS.filter((t) => t.status === 'Completed')
    const platform = completed.reduce((sum, t) => sum + t.platformFee, 0)
    const workers = completed.reduce((sum, t) => sum + t.workerAmount, 0)
    const gross = completed.reduce((sum, t) => sum + t.userAmount, 0)
    return { gross, workers, platform }
  }, [])

  return (
    <>
      <PageHeader title="Payment Management" subtitle="All transactions" />
      <SubNav items={SUB_NAV} />
      <div className="toolbar">
        <SearchBar
          placeholder="Search by ID, booking, client, or worker..."
          value={search}
          onChange={setSearch}
        />
        <FilterTabs tabs={['All', 'Completed', 'Pending', 'Failed']} activeTab={filterTab} onTabChange={setFilterTab} />
      </div>
      <SectionCard title="Commission Overview">
        <div className="detail-grid" style={{ marginBottom: 0 }}>
          <div className="detail-block">
            <label>Completed Gross Volume</label>
            <div className="value">{formatPeso(totals.gross)}</div>
          </div>
          <div className="detail-block">
            <label>Worker Earnings (Payout)</label>
            <div className="value">{formatPeso(totals.workers)}</div>
          </div>
          <div className="detail-block">
            <label>Platform Commission</label>
            <div className="value">
              {formatPeso(totals.platform)}{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                (~{Math.round(PLATFORM_RATE * 100)}% of completed payments)
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking</th>
                <th>Client</th>
                <th>Worker</th>
                <th>Client Paid</th>
                <th>Worker Earnings</th>
                <th>Platform Fee</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.displayId || t.id}</td>
                  <td>{t.booking}</td>
                  <td>{t.user}</td>
                  <td>{t.worker}</td>
                  <td>{formatPeso(t.userAmount)}</td>
                  <td>{formatPeso(t.workerAmount)}</td>
                  <td>{formatPeso(t.platformFee)}</td>
                  <td>{t.method}</td>
                  <td>{t.date}</td>
                  <td><Badge variant={t.status === 'Completed' ? 'approved' : 'pending'}>{t.status}</Badge></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/payments/transaction/${t.id}`} className="action-btn view" title="View">
                        <i className="fas fa-eye" />
                      </Link>
                      {/* {t.status === 'Completed' && (
                        <button
                          type="button"
                          className="action-btn delete"
                          title="Prepare Refund"
                          onClick={() => setRefundModal(t)}
                        >
                          <i className="fas fa-rotate-left" />
                        </button>
                      )} */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          info={`Showing ${filteredTransactions.length} of ${TRANSACTIONS.length} transactions`}
          hasPrev={false}
          hasNext={TRANSACTIONS.length > filteredTransactions.length}
        />
      </SectionCard>

      {refundModal && (
        <div className="modal-backdrop" onClick={() => setRefundModal(null)} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="modal-title">Refund Transaction {refundModal.id}</h2>
            <p className="modal-body">
              You are about to initiate a refund for <strong>{refundModal.user}</strong> on booking{' '}
              <strong>{refundModal.booking}</strong>. The worker would return{' '}
              {formatPeso(refundModal.workerAmount)} and the platform would return{' '}
              {formatPeso(refundModal.platformFee)}.
            </p>
            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Client Paid</label>
                <div className="value">{formatPeso(refundModal.userAmount)}</div>
              </div>
              <div className="detail-block">
                <label>Worker Earnings</label>
                <div className="value">{formatPeso(refundModal.workerAmount)}</div>
              </div>
              <div className="detail-block">
                <label>Platform Commission</label>
                <div className="value">{formatPeso(refundModal.platformFee)}</div>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setRefundModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setRefundModal(null)}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
