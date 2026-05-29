import { useState, useEffect } from 'react';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Button, Avatar, Badge, Menu, MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AddBox as AddBoxIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import type { NotificationType } from '../context/NotificationsContext';
import { authService } from '../services/auth.service';

const AVATAR_KEY = 'profileAvatar';

// Formatea el tiempo transcurrido de forma humana.
const timeAgo = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
};

const notifIcon = (type: NotificationType) => {
  if (type === 'success') return <CheckCircleIcon sx={{ color: '#27AE60' }} />;
  if (type === 'error') return <ErrorIcon sx={{ color: '#E74C3C' }} />;
  return <InfoIcon sx={{ color: '#6B9BD1' }} />;
};

const drawerWidth = 260;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  // Foto de perfil: caché local para pintar al instante + sincronización con el backend.
  const [avatarSrc, setAvatarSrc] = useState<string>(
    () => localStorage.getItem(AVATAR_KEY) || ''
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await authService.getProfile();
        if (cancelled) return;
        if (profile.avatarUrl) {
          setAvatarSrc(profile.avatarUrl);
          localStorage.setItem(AVATAR_KEY, profile.avatarUrl);
        } else {
          setAvatarSrc('');
          localStorage.removeItem(AVATAR_KEY);
        }
      } catch {
        // Sin backend: nos quedamos con lo que haya en la caché local.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenNotif = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(e.currentTarget);
    markAllRead(); // al abrir, se marcan todas como leídas
  };
  const handleCloseNotif = () => setNotifAnchor(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      // Pide al backend que borre la cookie HttpOnly de sesión.
      await authService.logout();
    } catch {
      // Aunque falle, cerramos sesión en el cliente igualmente.
    }
    // Limpiamos cachés locales para no filtrar datos al siguiente usuario.
    localStorage.removeItem(AVATAR_KEY);
    localStorage.removeItem('notifications');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Mis proyectos', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Nueva Generación 3D', icon: <AddBoxIcon />, path: '/new-project' },
    { text: 'Mi Perfil', icon: <AccountCircleIcon />, path: '/profile' }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#E3EBF5' }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        background: `linear-gradient(135deg, rgba(107, 155, 209, 0.12) 0%, rgba(168, 216, 234, 0.08) 100%)`,
        borderBottom: '1px solid rgba(107, 155, 209, 0.15)',
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

        {/* NOTIFICACIONES (historial completo) */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            selected={location.pathname === '/notifications'}
            onClick={() => navigate('/notifications')}
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                bgcolor: 'rgba(107, 155, 209, 0.12)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
                '&:hover': { bgcolor: 'rgba(107, 155, 209, 0.18)' },
              },
              '&:hover': { bgcolor: 'rgba(107, 155, 209, 0.06)' },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color:
                  location.pathname === '/notifications'
                    ? 'primary.main'
                    : 'text.secondary',
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary="Notificaciones"
              slotProps={{
                primary: {
                  sx: {
                    fontWeight:
                      location.pathname === '/notifications' ? 700 : 500,
                    fontSize: '0.95rem',
                  },
                },
              }}
            />
          </ListItemButton>
        </ListItem>
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
          bgcolor: '#E8EEF5',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(107, 155, 209, 0.3)',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(44, 74, 109, 0.12)',
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

          {/* Campana de notificaciones */}
          <IconButton color="inherit" onClick={handleOpenNotif} aria-label="notificaciones">
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Foto de perfil */}
          <IconButton
            onClick={() => navigate('/profile')}
            sx={{ ml: 1 }}
            aria-label="mi perfil"
          >
            <Avatar
              src={avatarSrc || undefined}
              sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* DROPDOWN DE NOTIFICACIONES */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleCloseNotif}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 380, maxWidth: '92vw', maxHeight: 460, mt: 1 } },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notificaciones recientes
          </Typography>
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 5, textAlign: 'center' }}>
            <NotificationsNoneIcon
              sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          [
            // Solo las últimas 5 en la campanita.
            ...notifications.slice(0, 5).map((n) => (
              <MenuItem
                key={n.id}
                onClick={handleCloseNotif}
                sx={{
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1.5,
                  borderLeft: n.read ? 'none' : '3px solid',
                  borderLeftColor: 'primary.main',
                  bgcolor: n.read ? 'transparent' : 'rgba(107, 155, 209, 0.06)',
                }}
              >
                <Box sx={{ mt: 0.3 }}>{notifIcon(n.type)}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: n.read ? 400 : 700 }}
                  >
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(n.createdAt)}
                  </Typography>
                </Box>
              </MenuItem>
            )),
            <Divider key="divider-ver-todas" />,
            <MenuItem
              key="ver-todas"
              onClick={() => {
                handleCloseNotif();
                navigate('/notifications');
              }}
              sx={{ justifyContent: 'center', py: 1.25 }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Ver todas las notificaciones
              </Typography>
            </MenuItem>,
          ]
        )}
      </Menu>
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
          p: 0,
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
