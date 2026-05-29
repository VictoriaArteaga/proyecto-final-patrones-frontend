import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, Link, 
  CircularProgress, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Mail as MailIcon, Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../services/auth.service';
import { getFriendlyError } from '../utils/errorMessages';
import type { LoginRequestDTO } from '../types/auth.types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const credentials: LoginRequestDTO = { email, password };
      const response = await authService.login(credentials);
      
      localStorage.setItem('token', response.token);
      // Guardar datos del usuario si vienen en la respuesta
      if ((response as any).user) {
        localStorage.setItem('user', JSON.stringify((response as any).user));
      }
      navigate('/new-project');
      
    } catch (err: any) {
      setError(
        getFriendlyError(err, 'Correo o contraseña incorrectos. Verifícalos e inténtalo de nuevo.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: `
        radial-gradient(circle at 20% 30%, rgba(107, 155, 209, 0.6) 0%, transparent 45%),
        radial-gradient(circle at 80% 70%, rgba(158, 141, 173, 0.55) 0%, transparent 45%),
        radial-gradient(circle at 10% 80%, rgba(168, 216, 234, 0.4) 0%, transparent 40%),
        linear-gradient(135deg, #F8F9FA 0%, #E8D1E0 50%, #A8D8EA 100%)
      `,
      backgroundAttachment: 'fixed',
      backgroundSize: '200% 200%, 200% 200%, 200% 200%, 100% 100%',
      animation: 'vivoBgMove 6s ease infinite',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 70% 20%, rgba(44, 74, 109, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 30% 60%, rgba(232, 209, 224, 0.2) 0%, transparent 50%)
        `,
        animation: 'vivoBgMove 8s ease-in-out infinite reverse',
        backgroundSize: '200% 200%',
        zIndex: 0,
        pointerEvents: 'none',
      }
    }}>
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={12} 
          sx={{ 
            padding: { xs: 4, sm: 5 }, 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(107, 155, 209, 0.1)',
          }}
        >
          {/* Decorative gradient line */}
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', 
            background: `linear-gradient(90deg, #2C4A6D, #6B9BD1, #9E8DAD, #2C4A6D)`,
            backgroundSize: '200% 100%',
            animation: 'softGradient 6s ease infinite',
          }} />

          {/* Icon circle */}
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, rgba(168, 216, 234, 0.2) 0%, rgba(158, 141, 173, 0.15) 100%)`,
            border: `2px solid rgba(107, 155, 209, 0.2)`,
            display: 'flex', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(107, 155, 209, 0.1)',
          }}>
            <LoginIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>

          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'primary.dark' }}>
            Bienvenido
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Ingresa tus credenciales para acceder al sistema
          </Typography>
          
          {error && (
            <Alert severity="error" variant="filled" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                component="label"
                sx={{ 
                  display: 'block',
                  mb: 1.5, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: '0.95rem'
                }}
              >
                Correo Electrónico
              </Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography 
                component="label"
                sx={{ 
                  display: 'block',
                  mb: 1.5, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: '0.95rem'
                }}
              >
                Contraseña
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Box>
            <Button
              type="submit" fullWidth variant="contained" color="primary" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1.1rem', mt: 2 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes una cuenta?{' '}
                <Link component={RouterLink} to="/register" underline="hover" color="secondary.main" sx={{ fontWeight: 700 }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
