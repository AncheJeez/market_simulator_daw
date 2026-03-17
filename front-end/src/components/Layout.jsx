import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ children, showSidebar, onLogout }) {
  const [toggled, setToggled] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!showSidebar) {
      setToggled(false)
    }
  }, [showSidebar])

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        {showSidebar && (
          <Sidebar
            toggled={toggled}
            collapsed={collapsed}
            onToggle={setToggled}
            onCollapseToggle={setCollapsed}
          />
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
              <button className="btn btn-danger" type="button" onClick={onLogout}>
                Log out
              </button>
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
