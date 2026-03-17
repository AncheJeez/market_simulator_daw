import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/Login'
import Register from './components/Register'
import AuthWelcome from './components/AuthWelcome'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Simulations from './components/Simulations'
import StoredMarket from './components/StoredMarket'
import DatabaseDashboard from './components/DatabaseDashboard'
import { useAuth } from './utils/auth'

function App() {
  const { currentUser, checking, login, logout, updateUser } = useAuth()
  const isLoggedIn = Boolean(currentUser)

  if (checking) {
    return null
  }

  return (
    <Layout showSidebar={isLoggedIn} onLogout={logout} currentUser={currentUser}>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <AuthWelcome user={currentUser} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/market/simulations"
          element={isLoggedIn ? <Simulations /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/market/stored"
          element={isLoggedIn ? <StoredMarket /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DatabaseDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={login} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile user={currentUser} onUpdate={updateUser} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? <Settings /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>
    </Layout>
  )
}

export default App
