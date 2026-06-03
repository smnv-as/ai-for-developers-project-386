import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/public/HomePage'
import { SlotsPage } from './pages/public/SlotsPage'
import { BookingPage } from './pages/public/BookingPage'
import { BookingSuccess } from './pages/public/BookingSuccess'
import { AdminApp } from './pages/admin/AdminApp'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/slots" element={<SlotsPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/success" element={<BookingSuccess />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
