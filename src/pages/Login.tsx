import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, Link, 
  CircularProgress, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { authService } from '../services/auth.service';
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
      navigate('/dashboard');
      
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciales incorrectas o el servidor no responde.';
      setError(message);
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
      background: 'radial-gradient(circle at top right, rgba(0, 229, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(213, 0, 249, 0.15) 0%, transparent 40%)'
    }}>
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={24} 
          sx={{ 
            padding: { xs: 4, sm: 5 }, 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
          }}
        >
          {/* Decorative element */}
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', 
            background: 'linear-gradient(90deg, #00E5FF, #D500F9)' 
          }} />

          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: '50%', 
            background: 'rgba(0, 229, 255, 0.1)',
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <LoginIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>

          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
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
            <TextField
              margin="normal" required fullWidth id="email" label="Correo Electrónico"
              name="email" autoComplete="email" autoFocus disabled={loading}
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña"
              type={showPassword ? 'text' : 'password'} id="password"
              autoComplete="current-password" disabled={loading}
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 4 }}
              slotProps={{
                input: {
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
            <Button
              type="submit" fullWidth variant="contained" color="primary" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
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
