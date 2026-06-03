import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/booking" replace />} />
      <Route path="/booking" element={<div>Бронирование</div>} />
      <Route path="/admin" element={<div>Админка</div>} />
    </Routes>
  )
}

export default App
