import { useState } from 'react';
import { 
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Toolbar, Typography, Button, Avatar 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  AddBox as AddBoxIcon, 
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Mis proyectos', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Nueva Generación 3D', icon: <AddBoxIcon />, path: '/new-project' }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        background: `linear-gradient(135deg, rgba(107, 155, 209, 0.08) 0%, rgba(168, 216, 234, 0.05) 100%)`,
        borderBottom: '1px solid rgba(107, 155, 209, 0.1)',
      }}>
        <Avatar sx={{ bgcolor: 'primary.main', color: '#FFFFFF', fontWeight: 700 }}>
          <span style={{ fontSize: '1.5rem' }}>✿</span>
        </Avatar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'primary.dark', letterSpacing: '-0.5px' }}>
          Arq- 3✿
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(107, 155, 209, 0.1)' }} />
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  bgcolor: 'rgba(107, 155, 209, 0.12)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(107, 155, 209, 0.18)',
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(107, 155, 209, 0.06)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: '0.95rem'
                    }
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(107, 155, 209, 0.1)' }} />
        <Button 
          fullWidth 
          variant="contained" 
          color="secondary" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
          sx={{ borderRadius: 2, py: 1, fontWeight: 600 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#FFFFFF',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(107, 155, 209, 0.1)',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(44, 74, 109, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(i => i.path === location.pathname)?.text || 'Aplicación'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(107, 155, 209, 0.1)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 4 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
