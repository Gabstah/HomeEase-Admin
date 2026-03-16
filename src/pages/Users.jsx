import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'
import SectionCard from '../components/common/SectionCard'
import Pagination from '../components/common/Pagination'
import Badge from '../components/common/Badge'
import { CLIENTS } from '../data/users'

export default function Users() {
  const [filterTab, setFilterTab] = useState('All')

  const filteredClients = CLIENTS.filter((u) => {
    if (filterTab === 'Active') return u.status === 'active'
    if (filterTab === 'Suspended') return u.status === 'suspended'
    return true
  })

  return (
    <>
      <PageHeader title="Client List" subtitle="All registered clients" />
      <div className="toolbar">
        <SearchBar placeholder="Search by name, email, or phone..." />
        <FilterTabs tabs={['All', 'Active', 'Suspended']} activeTab={filterTab} onTabChange={setFilterTab} />
      </div>
      <SectionCard>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Bookings</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <Badge variant={user.status === 'active' ? 'active' : 'suspended'}>{user.status}</Badge>
                  </td>
                  <td>{user.bookings}</td>
                  <td>{user.spent}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/users/client/${user.id}`} className="action-btn view" title="View">
                        <i className="fas fa-eye" />
                      </Link>
                      <button type="button" className="action-btn delete" title="Suspend">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          info={`Showing ${filteredClients.length} of ${CLIENTS.length} clients`}
          hasPrev={false}
          hasNext={false}
        />
      </SectionCard>
    </>
  )
}
