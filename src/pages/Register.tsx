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
      console.error("Error completo:", err);
      
      if (!err.response) {
        setError("Error de red. Asegúrate de que el servidor esté en ejecución.");
        return;
      }

      const status = err.response.status;
      const data = err.response.data;
      
      if (data) {
        if (data.errors && Array.isArray(data.errors)) {
          const validationMessages = data.errors.map((e: any) => e.defaultMessage || e.msg).join(' - ');
          setError(`Error de validación: ${validationMessages}`);
          return;
        }
        const backendError = data.message || data.error || JSON.stringify(data);
        setError(`Error ${status}: ${backendError}`);
      } else {
        setError(`Error ${status} del servidor.`);
      }
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
      background: 'radial-gradient(circle at top left, rgba(213, 0, 249, 0.15) 0%, transparent 40%), radial-gradient(circle at bottom right, rgba(0, 229, 255, 0.15) 0%, transparent 40%)'
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
            background: 'linear-gradient(90deg, #D500F9, #00E5FF)' 
          }} />

          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: '50%', 
            background: 'rgba(213, 0, 249, 0.1)',
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <PersonAddIcon color="secondary" sx={{ fontSize: 40 }} />
          </Box>

          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Crear Cuenta
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Únete a nosotros para empezar a crear
          </Typography>
          
          {error && <Alert severity="error" variant="filled" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" variant="filled" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>¡Registro exitoso! Llevándote al Login...</Alert>}

          <Box component="form" onSubmit={handleRegister} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal" required fullWidth id="nombre" label="Nombre Completo"
              name="nombre" autoFocus disabled={loading || success}
              value={nombre} onChange={(e) => setNombre(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              margin="normal" required fullWidth id="email" label="Correo Electrónico"
              name="email" autoComplete="email" disabled={loading || success}
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña"
              type={showPassword ? 'text' : 'password'} id="password" disabled={loading || success}
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 4 }}
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
              disabled={loading || success} sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Registrarse'}
            </Button>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" underline="hover" color="primary.main" sx={{ fontWeight: 700 }}>
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}