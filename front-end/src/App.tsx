import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/main-comps/Layout'
import Login from './components/main-comps/Login'
import Register from './components/main-comps/Register'
import AuthWelcome from './components/AuthWelcome'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Simulations from './components/Simulations'
import StoredMarket from './components/StoredMarket'
import Orders from './components/OrdersView'
import Positions from './components/Positions'
import DatabaseDashboard from './components/DatabaseDashboard'
import AdminDashboard from './components/AdminDashboard'
import UserDetail from './components/UserDetail'
import TradingNews from './components/TradingNews'
import Portfolio from './components/Portfolio'
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
          element={currentUser ? <AuthWelcome user={currentUser} /> : <Navigate to="/login" replace />}
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
          path="/trading/orders"
          element={isLoggedIn ? <Orders /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trading/positions"
          element={isLoggedIn ? <Positions /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DatabaseDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/portfolio"
          element={isLoggedIn ? <Portfolio /> : <Navigate to="/login" replace />}
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
          element={currentUser ? <Profile user={currentUser} onUpdate={updateUser} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? <Settings /> : <Navigate to="/login" replace />}
        />
                <Route
          path="/admin"
          element={isLoggedIn && currentUser?.userType === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" replace />}
        />
                <Route
          path="/admin/user/:id"
          element={isLoggedIn && currentUser?.userType === 'ADMIN' ? <UserDetail /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
        <Route
          path="/market/news"
          element={
            isLoggedIn ? (
              <div className="container py-4">
                <div className="d-flex align-items-center mb-4 px-2">
                  <div 
                    style={{ 
                      width: '4px', 
                      height: '24px', 
                      backgroundColor: '#f0b90b', 
                      marginRight: '12px',
                      borderRadius: '2px' 
                    }} 
                  />
                  <h4 className="mb-0 fw-bold text-white" style={{ letterSpacing: '0.5px' }}>
                    Trading Hot News
                  </h4>
                  <span className="badge ms-3" style={{ backgroundColor: 'rgba(240, 185, 11, 0.1)', color: '#f0b90b', fontSize: '0.7rem' }}>
                    LIVE FEED
                  </span>
                </div>

                {/* News Feed */}
                <div className="trading-card-entrance mb-4">
                  <TradingNews type="news" limit={15} />
                </div>
                
                {/* Reddit Feed */}
                <div className="trading-card-entrance" style={{ animationDelay: '0.2s' }}>
                  <TradingNews type="reddit" limit={15} />
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Layout>
  )
}

export default App
