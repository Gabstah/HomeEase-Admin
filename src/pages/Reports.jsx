import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SectionCard from '../components/common/SectionCard'
import Pagination from '../components/common/Pagination'
import Badge from '../components/common/Badge'
import FilterTabs from '../components/common/FilterTabs'

const SUB_NAV = [
  { to: '/reports/logs', label: 'System Logs' },
  { to: '/reports/service', label: 'Service Reports' },
  { to: '/reports/activity', label: 'User Activity Reports' },
  { to: '/reports/export', label: 'Export Reports' },
]

const SYSTEM_LOGS = [
  {
    time: 'Mar 2, 2025 09:15:10',
    level: 'INFO',
    category: 'Admin Actions',
    source: 'Pricing',
    message: 'Admin changed min price for Malolos (Cleaning) from ₱300 to ₱350.',
  },
  {
    time: 'Mar 2, 2025 09:30:21',
    level: 'INFO',
    category: 'Login History',
    source: 'Auth',
    message: 'User #1001 logged in from a new device.',
  },
  {
    time: 'Mar 2, 2025 10:02:00',
    level: 'WARN',
    category: 'System Errors',
    source: 'Payment',
    message: 'Payment gateway timeout while processing transaction #T300.',
  },
  {
    time: 'Mar 1, 2025 18:45:22',
    level: 'INFO',
    category: 'Status Changes',
    source: 'Verification',
    message: 'Worker #W503 verification status changed to Pending review.',
  },
  {
    time: 'Mar 1, 2025 14:35:02',
    level: 'INFO',
    category: 'Status Changes',
    source: 'API',
    message: 'Booking #B201 marked as Completed.',
  },
]

const SERVICE_REPORTS = [
  { metric: 'Popularity', value: 'Cleaning (60%), Plumbing (20%), Electrical (12%), Gardening (8%)' },
  { metric: 'Completion Rate', value: 'Completed: 78% · Cancelled: 14% · Disputed: 8%' },
  { metric: 'Regional Data', value: 'Most bookings: Malolos (3× Guiguinto)' },
  { metric: 'Average Rating', value: '4.7 / 5 (overall)' },
]

const ACTIVITY_REPORTS = [
  { metric: 'Engagement', value: 'New users this week: 24 · New workers: 6' },
  { metric: 'Activity', value: 'Users: 8 clients book weekly' },
  { metric: 'Worker Reliability', value: 'Declines: 12 total · Most declines: #W503 (4)' },
  { metric: 'App Usage', value: 'Peak usage: 6 PM – 9 PM' },
]

const TITLES = {
  logs: ['System Logs', 'View and filter logs'],
  service: ['Service Reports', 'Business performance summary'],
  activity: ['User Activity Reports', 'Engagement and behavior tracker'],
  export: ['Export Reports', 'Export data to CSV or PDF'],
}

export default function Reports() {
  const { pathname } = useLocation()
  const path = pathname.replace(/^\//, '') || 'reports'
  const view = path.includes('export') ? 'export' : path.includes('activity') ? 'activity' : path.includes('service') ? 'service' : 'logs'
  const [title, subtitle] = TITLES[view] || TITLES.logs
  const [filterTab, setFilterTab] = useState('All')

  const filterTabsForView =
    view === 'logs'
      ? ['All', 'Admin Actions', 'Login History', 'System Errors', 'Status Changes']
      : view === 'service'
      ? ['All', 'Popularity', 'Completion Rate', 'Regional Data', 'Average Rating']
      : view === 'activity'
      ? ['All', 'Engagement', 'Activity', 'Worker Reliability', 'App Usage']
      : ['All']

  const filteredRows =
    view === 'logs'
      ? SYSTEM_LOGS.filter((log) => (filterTab === 'All' ? true : log.category === filterTab))
      : view === 'service'
      ? SERVICE_REPORTS.filter((r) => (filterTab === 'All' ? true : r.metric === filterTab))
      : view === 'activity'
      ? ACTIVITY_REPORTS.filter((r) => (filterTab === 'All' ? true : r.metric === filterTab))
      : []

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={view === 'export' ? (
          <button type="button" className="btn btn-primary">
            <i className="fas fa-download" /> Export
          </button>
        ) : null}
      />
      <SubNav items={SUB_NAV} />
      <SectionCard>
        {view === 'export' ? (
          <>
            <p style={{ marginBottom: '1rem' }}>Select report type and date range to export.</p>
            <div className="detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="detail-block">
                <label>Report Type</label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option>Bookings</option>
                  <option>Payments</option>
                  <option>Users</option>
                  <option>Reviews</option>
                </select>
              </div>
              <div className="detail-block">
                <label>From</label>
                <input type="date" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }} />
              </div>
              <div className="detail-block">
                <label>To</label>
                <input type="date" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }} />
              </div>
              <div className="detail-block">
                <label>Format</label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <option>CSV</option>
                  <option>PDF</option>
                </select>
              </div>
            </div>
            <button type="button" className="btn btn-primary">
              <i className="fas fa-download" /> Generate Export
            </button>
          </>
        ) : (
          <>
            <div className="toolbar" style={{ marginBottom: '1rem' }}>
              <FilterTabs
                tabs={filterTabsForView}
                activeTab={filterTab}
                onTabChange={setFilterTab}
              />
            </div>

            {view === 'logs' && (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Category</th>
                        <th>Source</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((log, i) => (
                        <tr key={i}>
                          <td>{log.time}</td>
                          <td><Badge variant={log.level === 'WARN' ? 'pending' : 'active'}>{log.level}</Badge></td>
                          <td>{log.category}</td>
                          <td>{log.source}</td>
                          <td>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  info={`Showing ${filteredRows.length} of ${SYSTEM_LOGS.length} log entries`}
                  hasPrev={false}
                  hasNext={SYSTEM_LOGS.length > filteredRows.length}
                />
              </>
            )}

            {view === 'service' && (
              <div className="detail-grid" style={{ marginBottom: 0 }}>
                {filteredRows.map((row) => (
                  <div key={row.metric} className="detail-block">
                    <label>{row.metric}</label>
                    <div className="value">{row.value}</div>
                  </div>
                ))}
              </div>
            )}

            {view === 'activity' && (
              <div className="detail-grid" style={{ marginBottom: 0 }}>
                {filteredRows.map((row) => (
                  <div key={row.metric} className="detail-block">
                    <label>{row.metric}</label>
                    <div className="value">{row.value}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </SectionCard>
    </>
  )
}
