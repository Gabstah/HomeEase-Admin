import { useState } from 'react'
import SectionCard from '../components/common/SectionCard'

export default function Settings() {
  const [siteName, setSiteName] = useState('HomeEaseAdmin')
  const [supportEmail, setSupportEmail] = useState('support@HomeEaseAdmin.com')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">General administration settings</p>
      <SectionCard title="General">
        <div className="detail-grid">
          <div className="detail-block">
            <label>Site Name</label>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input" />
          </div>
          <div className="detail-block">
            <label>Support Email</label>
            <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="input" />
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleSave}>
          Save Changes
        </button>
        {saved && <p className="page-subtitle" style={{ marginTop: '0.75rem', color: 'var(--success)' }}>Settings saved.</p>}
      </SectionCard>
      <SectionCard title="Notifications">
        <p className="page-subtitle">Configure email and in-app notifications.</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
          <input type="checkbox" checked={notifications} onChange={() => setNotifications((prev) => !prev)} />
          Enable admin notifications
        </label>
      </SectionCard>
    </>
  )
}
