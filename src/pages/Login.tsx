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
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ padding: 4, width: '100%', borderRadius: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <LoginIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>

          {/* CORRECCIÓN: fontWeight movido adentro de sx */}
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenido
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder al sistema
          </Typography>
          
          {error && (
            <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal" required fullWidth id="email" label="Correo Electrónico"
              name="email" autoComplete="email" autoFocus disabled={loading}
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña"
              type={showPassword ? 'text' : 'password'} id="password"
              autoComplete="current-password" disabled={loading}
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              /* CORRECCIÓN: slotProps reemplaza a InputProps */
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
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', boxShadow: 3 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                {/* CORRECCIÓN: fontWeight movido adentro de sx */}
                <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 'bold' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
