import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import SearchBar from '../components/common/SearchBar'
import FilterTabs from '../components/common/FilterTabs'

const SEED_RULES = [
  { id: '1', city: 'Malolos', serviceType: 'Plumbing', minPrice: 500, maxPrice: 2500 },
  { id: '2', city: 'Malolos', serviceType: 'Cleaning', minPrice: 350, maxPrice: 1500 },
  { id: '3', city: 'Guiguinto', serviceType: 'Plumbing', minPrice: 450, maxPrice: 2200 },
]

function formatPeso(amount) {
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isNaN(num)) return '—'
  return `₱${num.toLocaleString()}`
}

export default function PriceControl() {
  const [rules, setRules] = useState(SEED_RULES)
  const [query, setQuery] = useState('')
  const [serviceTab, setServiceTab] = useState('All')

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('add') // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ city: '', serviceType: '', minPrice: '', maxPrice: '' })
  const [error, setError] = useState('')

  const serviceTypes = useMemo(() => {
    const types = Array.from(new Set(rules.map((r) => r.serviceType))).sort()
    return ['All', ...types]
  }, [rules])

  const filteredRules = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rules.filter((r) => {
      const matchesService = serviceTab === 'All' ? true : r.serviceType === serviceTab
      const matchesQuery = !q
        ? true
        : `${r.city} ${r.serviceType}`.toLowerCase().includes(q)
      return matchesService && matchesQuery
    })
  }, [rules, query, serviceTab])

  const closeModal = () => {
    setOpen(false)
    setMode('add')
    setEditingId(null)
    setForm({ city: '', serviceType: '', minPrice: '', maxPrice: '' })
    setError('')
  }

  const openAdd = () => {
    setMode('add')
    setEditingId(null)
    setForm({ city: '', serviceType: '', minPrice: '', maxPrice: '' })
    setError('')
    setOpen(true)
  }

  const openEdit = (rule) => {
    setMode('edit')
    setEditingId(rule.id)
    setForm({
      city: rule.city,
      serviceType: rule.serviceType,
      minPrice: String(rule.minPrice),
      maxPrice: String(rule.maxPrice),
    })
    setError('')
    setOpen(true)
  }

  const onSave = (e) => {
    e.preventDefault()
    setError('')

    const city = form.city.trim()
    const serviceType = form.serviceType.trim()
    const minPrice = Number(form.minPrice)
    const maxPrice = Number(form.maxPrice)

    if (!city || !serviceType) return setError('City and Service Type are required.')
    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) return setError('Min and Max price must be valid numbers.')
    if (minPrice < 0 || maxPrice < 0) return setError('Prices cannot be negative.')
    if (minPrice > maxPrice) return setError('Min price cannot be greater than Max price.')

    const duplicate = rules.find((r) => r.city.toLowerCase() === city.toLowerCase() && r.serviceType.toLowerCase() === serviceType.toLowerCase())
    if (mode === 'add' && duplicate) return setError('A rule for this City + Service Type already exists. Please edit it instead.')
    if (mode === 'edit' && duplicate && duplicate.id !== editingId) return setError('Another rule with this City + Service Type already exists.')

    if (mode === 'add') {
      const next = {
        id: String(Date.now()),
        city,
        serviceType,
        minPrice,
        maxPrice,
      }
      setRules((prev) => [next, ...prev])
      closeModal()
      return
    }

    setRules((prev) =>
      prev.map((r) =>
        r.id === editingId ? { ...r, city, serviceType, minPrice, maxPrice } : r,
      ),
    )
    closeModal()
  }

  return (
    <>
      <PageHeader
        title="Price Control"
        subtitle="Set min/max pricing rules by city and service type."
        actions={(
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            <i className="fas fa-plus" /> Add Rule
          </button>
        )}
      />

      <div className="toolbar">
        <SearchBar placeholder="Search city or service..." value={query} onChange={setQuery} />
        <FilterTabs tabs={serviceTypes} activeTab={serviceTab} onTabChange={setServiceTab} />
      </div>

      <SectionCard title="Pricing Matrix">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>City / Location</th>
                <th>Service Type</th>
                <th>Min Price (₱)</th>
                <th>Max Price (₱)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.city}</strong></td>
                  <td>{r.serviceType}</td>
                  <td>{formatPeso(r.minPrice)}</td>
                  <td>{formatPeso(r.maxPrice)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="action-btn view"
                        title="Edit"
                        onClick={() => openEdit(r)}
                      >
                        <i className="fas fa-pen" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--text-muted)', padding: '1rem' }}>
                    No pricing rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {open && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="modal-title">{mode === 'add' ? 'Add Pricing Rule' : 'Edit Pricing Rule'}</h2>
            <p className="modal-body">Define the allowed price range for a service in a location.</p>

            <form onSubmit={onSave} className="auth-form" style={{ gap: '0.75rem' }}>
              <div className="form-field">
                <label htmlFor="pc-city">City / Location</label>
                <input
                  id="pc-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Malolos"
                />
              </div>

              <div className="form-field">
                <label htmlFor="pc-service">Service Type</label>
                <input
                  id="pc-service"
                  type="text"
                  value={form.serviceType}
                  onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
                  placeholder="e.g. Plumbing"
                />
              </div>

              <div className="detail-grid" style={{ marginBottom: 0 }}>
                <div className="detail-block">
                  <label htmlFor="pc-min">Min Price (₱)</label>
                  <input
                    id="pc-min"
                    type="number"
                    min="0"
                    value={form.minPrice}
                    onChange={(e) => setForm((p) => ({ ...p, minPrice: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </div>
                <div className="detail-block">
                  <label htmlFor="pc-max">Max Price (₱)</label>
                  <input
                    id="pc-max"
                    type="number"
                    min="0"
                    value={form.maxPrice}
                    onChange={(e) => setForm((p) => ({ ...p, maxPrice: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {mode === 'add' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

