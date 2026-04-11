import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, Link, 
  CircularProgress, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { authService } from '../services/auth.service';
import type { RegisterRequestDTO } from '../types/auth.types';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userData: RegisterRequestDTO = { username: nombre, email, password };
      await authService.register(userData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      const backendError = err.response?.data?.message || err.response?.data || 'Error en el servidor al registrar.';
      const errorMessage = typeof backendError === 'string' ? backendError : JSON.stringify(backendError);
      
      setError(`Rechazado por el backend: ${errorMessage}`);
      console.error("Error completo:", err.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ padding: 4, width: '100%', borderRadius: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <PersonAddIcon color="secondary" sx={{ fontSize: 40 }} />
          </Box>

          {/* CORRECCIÓN 3: fontWeight movido adentro de sx */}
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Crear Cuenta
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>¡Registro exitoso! Llevándote al Login...</Alert>}

          <Box component="form" onSubmit={handleRegister} noValidate>
            <TextField
              margin="normal" required fullWidth id="nombre" label="Nombre Completo"
              name="nombre" autoFocus disabled={loading || success}
              value={nombre} onChange={(e) => setNombre(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal" required fullWidth id="email" label="Correo Electrónico"
              name="email" autoComplete="email" disabled={loading || success}
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña"
              type={showPassword ? 'text' : 'password'} id="password" disabled={loading || success}
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              /* CORRECCIÓN 2: Uso de slotProps en lugar de InputProps para las nuevas versiones de MUI */
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading || success}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" color="secondary" size="large"
              disabled={loading || success} sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Registrarse'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                {/* CORRECCIÓN 1: fontWeight movido adentro de sx */}
                <Link component={RouterLink} to="/login" sx={{ fontWeight: 'bold' }}>Inicia sesión aquí</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}