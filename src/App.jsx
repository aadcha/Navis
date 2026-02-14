import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AllShips from './pages/AllShips'
import Enterprise from './pages/Enterprise'
import Captain from './pages/Captain'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ships" element={<AllShips />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="/captain" element={<Captain />} />
    </Routes>
  )
}
