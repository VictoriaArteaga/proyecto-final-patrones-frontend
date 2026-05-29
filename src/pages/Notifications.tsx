import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
} from '@mui/material';
import {
  NotificationsNone as NotificationsNoneIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as ErrorIcon,
  Info as InfoIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';

import { useNotifications } from '../context/NotificationsContext';
import type { NotificationType } from '../context/NotificationsContext';

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

export default function Notifications() {
  const { notifications, markAllRead, clearAll } = useNotifications();

  // Al entrar al historial, marcamos todo como leído.
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: `
          radial-gradient(circle at 20% 30%, rgba(107, 155, 209, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(158, 141, 173, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 10% 80%, rgba(168, 216, 234, 0.1) 0%, transparent 40%),
          linear-gradient(135deg, #F8F9FA 0%, #E8D1E0 10%, #A8D8EA 100%)
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: '200% 200%, 200% 200%, 200% 200%, 100% 100%',
        animation: 'vivoBgMove 6s ease infinite',
        position: 'relative',
        overflow: 'auto',
        py: 4,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}
              color="primary.main"
            >
              Notificaciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Historial completo de tus avisos.
            </Typography>
          </Box>

          {notifications.length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DeleteSweepIcon />}
              onClick={clearAll}
            >
              Limpiar todo
            </Button>
          )}
        </Box>

        {/* VACÍO */}
        {notifications.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              border: '2px dashed rgba(107, 155, 209, 0.3)',
              boxShadow: 'none',
            }}
          >
            <NotificationsNoneIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No tienes notificaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aquí aparecerán los avisos cuando tus diseños estén listos.
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notifications.map((n) => (
              <Card
                key={n.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  borderLeft: '4px solid',
                  borderLeftColor:
                    n.type === 'success'
                      ? '#27AE60'
                      : n.type === 'error'
                      ? '#E74C3C'
                      : '#6B9BD1',
                }}
              >
                <Box sx={{ mt: 0.3 }}>{notifIcon(n.type)}</Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(n.createdAt)}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
