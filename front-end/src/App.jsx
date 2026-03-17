import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Register from './components/Register'
import { useAuth } from './utils/auth'

function App() {
  const { currentUser, login, logout } = useAuth()

  return (
    <Layout showSidebar={Boolean(currentUser)} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  )
}

export default App
