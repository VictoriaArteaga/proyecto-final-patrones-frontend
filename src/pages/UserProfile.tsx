import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function UserProfile() {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData({ ...user, avatar: user.avatar || '' });
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede exceder 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newUserData = { ...userData, avatar: reader.result as string };
        setUserData(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const newUserData = { ...userData, avatar: '' };
    setUserData(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 70% 20%, rgba(44, 74, 109, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 30% 60%, rgba(232, 209, 224, 0.1) 0%, transparent 50%)
        `,
        animation: 'vivoBgMove 8s ease-in-out infinite reverse',
        backgroundSize: '200% 200%',
        zIndex: 0,
        pointerEvents: 'none',
      },
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '600px' }}>
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(107, 155, 209, 0.15)',
            boxShadow: '0 12px 40px rgba(44, 74, 109, 0.15)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative', mb: 3, display: 'inline-block' }}>
              <Avatar
                sx={{
                  width: 140,
                  height: 140,
                  background: userData.avatar
                    ? 'transparent'
                    : `linear-gradient(135deg, #6B9BD1 0%, #9E8DAD 100%)`,
                  fontSize: '3rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '4px solid white',
                  boxShadow: '0 8px 24px rgba(44, 74, 109, 0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(107, 155, 209, 0.3)',
                  },
                }}
                src={userData.avatar || undefined}
                onClick={handleAvatarClick}
              >
                {!userData.avatar && getInitials(userData.username)}
              </Avatar>

              {/* Upload Button */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'secondary.main',
                  borderRadius: '50%',
                  p: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '3px solid white',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(158, 141, 173, 0.4)',
                  },
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCameraIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </Box>

            {/* User Info */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.dark',
                mb: 0.5,
              }}
            >
              {userData.username}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.95rem',
              }}
            >
              {userData.email}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {userData.avatar && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveAvatar}
                  sx={{ borderRadius: 2 }}
                >
                  Eliminar foto
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<PhotoCameraIcon />}
                onClick={handleAvatarClick}
                sx={{ borderRadius: 2 }}
              >
                Cambiar foto
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
