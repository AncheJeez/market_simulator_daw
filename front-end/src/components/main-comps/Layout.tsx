import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'
import type { User } from '../../utils/auth'
import defaultUser from '../../assets/default-user.jpg'
import { assetUrl } from '../../utils/api'

type LayoutProps = {
  children: ReactNode
  showSidebar: boolean
  onLogout: () => void
  currentUser: User | null
}

function Layout({ children, showSidebar, onLogout, currentUser }: LayoutProps) {
  const [toggled, setToggled] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!showSidebar) {
      setToggled(false)
    }
  }, [showSidebar])

  const profileUrl = useMemo(() => {
    if (!currentUser?.profilePicturePath) {
      return defaultUser
    }
    const normalized = currentUser.profilePicturePath.replace(/^\/+/, '')
    return assetUrl(normalized, defaultUser)
  }, [currentUser])

  const colors = {
    accentGold: '#f0b90b',
    headerEnd: '#141f38',
    headerStart: '#1a2949'
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <style>
        {`
          .custom-header-gradient {
            background: linear-gradient(90deg, ${colors.headerStart} 0%, ${colors.headerEnd} 100%);
          }
          .custom-dropdown-toggle::after {
            color: ${colors.accentGold} !important;
            vertical-align: middle;
            margin-left: 0.5rem;
          }
        `}
      </style>
      <div className="d-flex flex-grow-1 align-items-stretch" style={{ minHeight: 0 }}>
        {showSidebar && (
          <div className="d-flex align-self-stretch" style={{ minHeight: 0 }}>
            <Sidebar
              toggled={toggled}
              collapsed={collapsed}
              onToggle={setToggled}
              onCollapseToggle={setCollapsed}
              currentUser={currentUser}
            />
          </div>
        )}
        <div className="flex-grow-1 d-flex flex-column">
          {showSidebar && (
            <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom custom-header-gradient">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary d-md-none"
                  type="button"
                  onClick={() => setToggled(true)}
                >
                  Menu
                </button>
              </div>
              <div className="dropdown">
                <button
                  className="btn p-0 border-0 bg-transparent dropdown-toggle custom-dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={profileUrl}
                    alt="Profile"
                    width="44"
                    height="44"
                    className="rounded border"
                    style={{ borderColor: colors.accentGold + '44' }}
                  />
                </button>
                <ul 
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" 
                  style={{ 
                    backgroundColor: '#22345f', 
                    border: '1px solid #253a66' 
                  }}
                >
                  <li>
                    <Link 
                      className="dropdown-item custom-nav-link" 
                      to="/profile"
                      style={{ color: '#ffffff' }}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item custom-nav-link" 
                      to="/settings"
                      style={{ color: '#ffffff' }}
                    >
                      Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" style={{ backgroundColor: '#253a66' }} /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      type="button" 
                      onClick={onLogout}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            </header>
          )}
          <main className="container py-5 flex-grow-1">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
