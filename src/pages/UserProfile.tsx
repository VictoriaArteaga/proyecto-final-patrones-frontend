import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  MarkEmailRead as RecoveryIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

import { authService } from '../services/auth.service';
import { getFriendlyError } from '../utils/errorMessages';
import type { UserProfileDTO } from '../types/auth.types';

// Caché local de la foto: la fuente de verdad es el backend (profile.avatarUrl),
// pero guardamos una copia para pintar al instante y como respaldo offline.
const AVATAR_KEY = 'profileAvatar';

const roleLabel = (role?: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'USER':
      return 'Usuario';
    default:
      return role || '—';
  }
};

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<string>(
    () => localStorage.getItem(AVATAR_KEY) || ''
  );
  // Estados de la foto: guardando, y mensaje de éxito/info.
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await authService.getProfile();
        if (!cancelled) {
          setProfile(data);
          // El backend manda: sincronizamos la foto y la caché local.
          if (data.avatarUrl) {
            setAvatar(data.avatarUrl);
            localStorage.setItem(AVATAR_KEY, data.avatarUrl);
          } else {
            setAvatar('');
            localStorage.removeItem(AVATAR_KEY);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getFriendlyError(err, 'No pudimos cargar tu perfil. Inténtalo de nuevo.')
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      const previous = avatar;

      // Optimista: la mostramos ya y la cacheamos.
      setAvatar(result);
      localStorage.setItem(AVATAR_KEY, result);
      setError('');
      setAvatarMsg('');
      setSavingAvatar(true);

      try {
        // Guardamos en el backend (ligado a la cuenta → visible en cualquier dispositivo).
        const updated = await authService.updateAvatar(result);
        const saved = updated.avatarUrl ?? result;
        setAvatar(saved);
        localStorage.setItem(AVATAR_KEY, saved);
        setProfile(updated);
        setAvatarMsg('Foto de perfil actualizada.');
      } catch (err) {
        // Si el backend falla, revertimos para no engañar al usuario.
        setAvatar(previous);
        if (previous) localStorage.setItem(AVATAR_KEY, previous);
        else localStorage.removeItem(AVATAR_KEY);
        setError(
          getFriendlyError(
            err,
            'No pudimos guardar tu foto en el servidor. Inténtalo de nuevo.'
          )
        );
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    const previous = avatar;

    setAvatar('');
    localStorage.removeItem(AVATAR_KEY);
    setError('');
    setAvatarMsg('');
    setSavingAvatar(true);

    try {
      await authService.deleteAvatar();
      setProfile((p) => (p ? { ...p, avatarUrl: null } : p));
      setAvatarMsg('Foto de perfil eliminada.');
    } catch (err) {
      // Revertimos si el backend no pudo eliminarla.
      setAvatar(previous);
      if (previous) localStorage.setItem(AVATAR_KEY, previous);
      setError(
        getFriendlyError(
          err,
          'No pudimos eliminar tu foto en el servidor. Inténtalo de nuevo.'
        )
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  const getInitials = (name?: string) =>
    (name || '')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  // Filas de información del usuario (sin contraseña).
  const infoRows = profile
    ? [
        {
          icon: <PersonIcon />,
          label: 'Nombre de usuario',
          value: profile.username,
        },
        {
          icon: <EmailIcon />,
          label: 'Correo electrónico',
          value: profile.email,
        },
        {
          icon: <BadgeIcon />,
          label: 'Rol',
          value: roleLabel(profile.role),
        },
        {
          icon: <RecoveryIcon />,
          label: 'Correo de recuperación',
          value: profile.recoveryEmail || 'No registrado',
        },
      ]
    : [];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 5,
        px: { xs: 2, sm: 4 },
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
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 620 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1 }}
          color="primary.main"
        >
          Mi perfil
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Esta es la información de tu cuenta.
        </Typography>

        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(107, 155, 209, 0.15)',
            boxShadow: '0 12px 40px rgba(44, 74, 109, 0.15)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* AVATAR */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                <Avatar
                  src={avatar || undefined}
                  onClick={handleAvatarClick}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '2.6rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: avatar
                      ? 'transparent'
                      : 'linear-gradient(135deg, #6B9BD1 0%, #9E8DAD 100%)',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 8px 24px rgba(44, 74, 109, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.04)',
                      boxShadow: '0 12px 32px rgba(107, 155, 209, 0.3)',
                    },
                  }}
                >
                  {!avatar && getInitials(profile?.username)}
                </Avatar>

                {/* Botón de cambiar foto: círculo perfecto y simétrico */}
                <Box
                  onClick={handleAvatarClick}
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                    border: '3px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 12px rgba(158, 141, 173, 0.4)',
                    },
                  }}
                >
                  <PhotoCameraIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </Box>

              {/* Botones de foto */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  mt: 2.5,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  disabled={savingAvatar}
                  startIcon={
                    savingAvatar ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PhotoCameraIcon />
                    )
                  }
                  onClick={handleAvatarClick}
                  sx={{ borderRadius: 2 }}
                >
                  {savingAvatar ? 'Guardando...' : 'Cambiar foto'}
                </Button>
                {avatar && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    disabled={savingAvatar}
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveAvatar}
                    sx={{ borderRadius: 2 }}
                  >
                    Eliminar foto
                  </Button>
                )}
              </Box>

              {/* Aviso de éxito al guardar/eliminar la foto */}
              {avatarMsg && (
                <Alert
                  severity="success"
                  sx={{ mt: 2, borderRadius: 2, width: '100%' }}
                  onClose={() => setAvatarMsg('')}
                >
                  {avatarMsg}
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* CARGANDO / ERROR / INFO */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress size={40} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2, my: 2 }}>
                {error}
              </Alert>
            ) : (
              <Box>
                {infoRows.map((row) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      borderBottom: '1px solid rgba(107, 155, 209, 0.12)',
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(107, 155, 209, 0.12)',
                        color: 'primary.main',
                      }}
                    >
                      {row.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          wordBreak: 'break-word',
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Verificación en dos pasos */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                  }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(107, 155, 209, 0.12)',
                      color: 'primary.main',
                    }}
                  >
                    <VerifiedUserIcon />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block' }}
                    >
                      Verificación en dos pasos
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        profile?.twoFactorEnabled ? 'Activada' : 'Desactivada'
                      }
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        bgcolor: profile?.twoFactorEnabled
                          ? '#27AE60'
                          : '#9AA0A6',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
