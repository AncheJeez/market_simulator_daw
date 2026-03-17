import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import { Link } from 'react-router-dom'

type SidebarProps = {
  toggled: boolean
  collapsed: boolean
  onToggle: (value: boolean) => void
  onCollapseToggle: (value: boolean) => void
}

function Sidebar({ toggled, collapsed, onToggle, onCollapseToggle }: SidebarProps) {
  return (
    <div className="d-flex flex-column h-100" style={{ flex: '1 1 auto' }}>
      <ProSidebar
        toggled={toggled}
        collapsed={collapsed}
        breakPoint="md"
        onBackdropClick={() => onToggle(false)}
        backgroundColor="#0f172a"
        rootStyles={{ height: '100%' }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 py-3">
          <span className="text-white fw-semibold">Menu</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-light d-none d-md-inline-flex"
              onClick={() => onCollapseToggle(!collapsed)}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
            <button
              className="btn btn-sm btn-outline-light d-md-none"
              onClick={() => onToggle(false)}
            >
              Close
            </button>
          </div>
        </div>
        <Menu
          menuItemStyles={{
            button: ({ level }) => ({
              color: level === 0 ? '#ffffff' : '#0f172a',
              backgroundColor: level === 0 ? 'transparent' : '#f8f9fa',
              '&:hover': {
                color: '#0f172a',
                backgroundColor: '#f8f9fa',
              },
            }),
          }}
        >
          <MenuItem component={<Link to="/" />}>Home</MenuItem>
          <MenuItem component={<Link to="/dashboard" />}>Dashboard</MenuItem>
          <SubMenu label="Market">
            <MenuItem component={<Link to="/market/simulations" />}>Simulations</MenuItem>
            <MenuItem component={<Link to="/market/stored" />}>Stored</MenuItem>
            <MenuItem>News</MenuItem>
          </SubMenu>
          <SubMenu label="Trading">
            <MenuItem>Orders</MenuItem>
            <MenuItem>Positions</MenuItem>
          </SubMenu>
          <MenuItem>Portfolio</MenuItem>
        </Menu>
      </ProSidebar>
    </div>
  )
}

export default Sidebar
