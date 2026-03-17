import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'
import type { User } from '../utils/auth'

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
      return null
    }
    const normalized = currentUser.profilePicturePath.replace(/^\/+/, '')
    return `http://localhost:8080/${normalized}`
  }, [currentUser])

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1 align-items-stretch" style={{ minHeight: 0 }}>
        {showSidebar && (
          <div className="d-flex align-self-stretch" style={{ minHeight: 0 }}>
            <Sidebar
              toggled={toggled}
              collapsed={collapsed}
              onToggle={setToggled}
              onCollapseToggle={setCollapsed}
            />
          </div>
        )}
        <div className="flex-grow-1 d-flex flex-column">
          {showSidebar && (
            <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white">
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
                  className="btn p-0 border-0 bg-transparent dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {profileUrl ? (
                    <img
                      src={profileUrl}
                      alt="Profile"
                      width="44"
                      height="44"
                      className="rounded border"
                    />
                  ) : (
                    <div
                      className="rounded border d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44 }}
                    >
                      <span className="text-muted small">U</span>
                    </div>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" type="button" onClick={onLogout}>
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
