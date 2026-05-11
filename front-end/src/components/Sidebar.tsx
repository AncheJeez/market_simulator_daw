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

  const colors = {
    primaryBlue: '#1a2949',
    darkerBlue: '#141f38',
    hoverBlue: '#253a66',
    textWhite: '#ffffff',
    textMuted: '#b0bccc',
    accentGold: '#f0b90b' 
  };

  const iconStyle = { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px', 
    minHeight: '24px',
  };

  return (
    <div className="d-flex flex-column h-100" style={{ flex: '1 1 auto' }}>
      <ProSidebar
        toggled={toggled}
        collapsed={collapsed}
        breakPoint="md"
        onBackdropClick={() => onToggle(false)}
        backgroundColor={colors.primaryBlue}
        transitionDuration={300}
        rootStyles={{
          height: '100%',
          borderRightWidth: '0px',
          borderRightStyle: 'none',
        }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 py-3">
          <div className="d-flex gap-2 ms-auto">
            <button
              className="btn btn-sm btn-outline-light d-none d-md-inline-flex align-items-center justify-content-center"
              onClick={() => onCollapseToggle(!collapsed)}
              style={{ width: '40px', height: '32px' }}
            >
              {collapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
                  <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
                  <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
                </svg>
              )}
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
              position: 'relative',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                color: colors.accentGold,
                backgroundColor: colors.hoverBlue,
              },
            }),
            subMenuContent: {
              backgroundColor: colors.darkerBlue,
            },
            label: {
              fontWeight: 500,
              transition: 'opacity 0.3s ease, margin 0.3s ease',
              opacity: collapsed ? 0 : 1,
              marginLeft: '10px',
            },
            icon: {
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            },
            SubMenuExpandIcon: {
              position: 'absolute',
              top: '8px',
              right: '12px',
              display: collapsed ? 'none' : 'block',
              color: colors.textMuted,
              '& span': {
                  fontSize: '10px',
              }
            },
          }}
        >
          <MenuItem 
            component={<Link to="/" />} 
            icon={<div style={iconStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
            </div>}
          >
            Home
          </MenuItem>

          <MenuItem 
            component={<Link to="/dashboard" />}
            icon={<div style={iconStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm200-80v-240H200v240h200Zm80 0h280v-240H480v240ZM200-520h560v-240H200v240Z"/></svg>
            </div>}
          >
            Dashboard
          </MenuItem>

          <SubMenu 
            label="Market" 
            open={openSubMenu === 'market'} 
            onOpenChange={() => handleSubMenuToggle('market')}
            icon={<div style={iconStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M308.5-291.5Q320-303 320-320t-11.5-28.5Q297-360 280-360t-28.5 11.5Q240-337 240-320t11.5 28.5Q263-280 280-280t28.5-11.5ZM240-440h80v-240h-80v240Zm200 160h280v-80H440v80Zm0-160h280v-80H440v80Zm0-160h280v-80H440v80ZM160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm0-80h640v-560H160v560Zm0 0v-560 560Z"/></svg>
            </div>}
          >
            <MenuItem component={<Link to="/market/simulations" />}
              icon={<div style={iconStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z"/></svg>
              </div>}
            >Simulations</MenuItem>
            <MenuItem>News</MenuItem>
          </SubMenu>

          <SubMenu 
            label="Trading" 
            open={openSubMenu === 'trading'} 
            onOpenChange={() => handleSubMenuToggle('trading')}
            icon={<div style={iconStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z"/></svg>
            </div>}
          >
            <MenuItem>Orders</MenuItem>
            <MenuItem>Positions</MenuItem>
          </SubMenu>

          <MenuItem icon={<div style={iconStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z"/></svg>
          </div>}>
            Portfolio
          </MenuItem>

          {currentUser?.userType === 'ADMIN' && (
            <SubMenu 
              label="Administration" 
              open={openSubMenu === 'admin'} 
              onOpenChange={() => handleSubMenuToggle('admin')}
              icon={<div style={iconStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z"/></svg>
              </div>}
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