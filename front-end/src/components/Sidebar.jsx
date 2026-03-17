import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'

function Sidebar({ toggled, collapsed, onToggle, onCollapseToggle }) {
  return (
    <ProSidebar
      toggled={toggled}
      collapsed={collapsed}
      breakPoint="md"
      onBackdropClick={() => onToggle(false)}
      backgroundColor="#0f172a"
      rootStyles={{ height: '100vh' }}
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
        <MenuItem>Dashboard</MenuItem>
        <MenuItem>Portfolio</MenuItem>
        <SubMenu label="Trading">
          <MenuItem>Orders</MenuItem>
          <MenuItem>Positions</MenuItem>
        </SubMenu>
        <SubMenu label="Market">
          <MenuItem>Quotes</MenuItem>
          <MenuItem>News</MenuItem>
        </SubMenu>
        <SubMenu label="Account">
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
        </SubMenu>
      </Menu>
    </ProSidebar>
  )
}

export default Sidebar
