import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import MemberPortal from './components/MemberPortal'
import SuperAdminLogin from './components/SuperAdminLogin'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import DigitalLiteracyPage from './components/DigitalLiteracyPage'
import AiForHealthcarePage from './components/AiForHealthcarePage'
import PrivacyPage from './components/PrivacyPage'
import WorkshopsPage from './components/WorkshopsPage'
import UnsubscribePage from './components/UnsubscribePage'
import AiForSmallBusinessPage from './components/AiForSmallBusinessPage'
import './App.css'
import './theme.css'
import './home.css'

function AdminRoute() {
  const stored = sessionStorage.getItem('admin_token')
  const [token, setToken] = useState(stored || '')

  if (!token) return <AdminLogin onLogin={setToken} />
  return <AdminDashboard token={token} />
}

function SuperAdminRoute() {
  const stored = sessionStorage.getItem('superadmin_token')
  const [token, setToken] = useState(stored || '')

  if (!token) return <SuperAdminLogin onLogin={setToken} />
  return <SuperAdminDashboard token={token} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/digital-literacy" element={<DigitalLiteracyPage />} />
        <Route path="/ai-for-healthcare" element={<AiForHealthcarePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route path="/ai-for-small-business" element={<AiForSmallBusinessPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/superadmin" element={<SuperAdminRoute />} />
        <Route path="/member" element={<MemberPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
