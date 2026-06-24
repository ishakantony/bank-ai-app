import { Routes, Route } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  )
}
