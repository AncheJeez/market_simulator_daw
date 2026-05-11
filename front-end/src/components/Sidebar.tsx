import { useState } from 'react'
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import { Link } from 'react-router-dom'
import { User } from '../utils/auth'

type SidebarProps = {
  currentUser: User | null
  toggled: boolean
  collapsed: boolean
  onToggle: (value: boolean) => void
  onCollapseToggle: (value: boolean) => void
}

function Sidebar({ toggled, collapsed, onToggle, onCollapseToggle, currentUser }: SidebarProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSubMenuToggle = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  // Define the blue theme colors for consistency
  const colors = {
    primaryBlue: '#1a2949',
    darkerBlue: '#141f38',
    hoverBlue: '#253a66',
    textWhite: '#ffffff',
    textMuted: '#b0bccc',
    accentGold: '#f0b90b' // Keeping the gold for hover/active states as it fits trading
  };

  return (
    <div className="d-flex flex-column h-100" style={{ flex: '1 1 auto' }}>
      <ProSidebar
        toggled={toggled}
        collapsed={collapsed}
        breakPoint="md"
        onBackdropClick={() => onToggle(false)}
        backgroundColor={colors.primaryBlue}
        rootStyles={{
          height: '100%',
          borderRightWidth: '0px',
          borderRightStyle: 'none',
        }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 py-3">
          {!collapsed && <span className="text-white fw-semibold tracking-wider">TERMINAL</span>}
          <div className="d-flex gap-2 ms-auto">
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
              color: level === 0 ? colors.textWhite : colors.textMuted,
              backgroundColor: 'transparent',
              '&:hover': {
                color: colors.accentGold,
                backgroundColor: colors.hoverBlue,
              },
            }),
            subMenuContent: {
              backgroundColor: colors.darkerBlue,
            }
          }}
        >
          <MenuItem component={<Link to="/" />}>Home</MenuItem>
          <MenuItem component={<Link to="/dashboard" />}>Dashboard</MenuItem>

          <SubMenu 
            label="Market" 
            open={openSubMenu === 'market'} 
            onOpenChange={() => handleSubMenuToggle('market')}
          >
            <MenuItem component={<Link to="/market/simulations" />}>Simulations</MenuItem>
            <MenuItem>News</MenuItem>
          </SubMenu>

          <SubMenu 
            label="Trading" 
            open={openSubMenu === 'trading'} 
            onOpenChange={() => handleSubMenuToggle('trading')}
          >
            <MenuItem>Orders</MenuItem>
            <MenuItem>Positions</MenuItem>
          </SubMenu>

          <MenuItem>Portfolio</MenuItem>

          {currentUser?.userType === 'ADMIN' && (
            <SubMenu 
              label="Administration" 
              open={openSubMenu === 'admin'} 
              onOpenChange={() => handleSubMenuToggle('admin')}
            >
              <MenuItem component={<Link to="/admin" />}>Users</MenuItem>
              <MenuItem component={<Link to="/market/stored" />}>Stored</MenuItem>
            </SubMenu>
          )}
        </Menu>
      </ProSidebar>
    </div>
  )
}

export default Sidebar