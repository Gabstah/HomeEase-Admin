import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import SubNav from '../components/common/SubNav'
import SectionCard from '../components/common/SectionCard'

const SUB_NAV = [
  { to: '/reviews', label: 'All Reviews' },
  { to: '/reviews/flagged', label: 'Flagged Reviews' },
]

export default function ReviewDetail() {
  const { id } = useParams()

  return (
    <>
      <PageHeader
        title="Review Detail"
        subtitle={`Review ${id ? `#${id.slice(-6).toUpperCase()}` : ''}`}
        actions={<Link to="/reviews" className="btn btn-outline">Back</Link>}
      />
      <SectionCard>
        <p style={{ color: 'var(--text-muted)' }}>
          Reviews API will be connected in Phase 4. This route now uses a dynamic ID parameter.
        </p>
      </SectionCard>
      <SubNav items={SUB_NAV} />
    </>
  )
}
