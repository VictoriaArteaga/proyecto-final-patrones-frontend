import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, Link, 
  CircularProgress, InputAdornment, IconButton, FormHelperText, Stack
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd as PersonAddIcon, Person as PersonIcon, Lock as LockIcon, Mail as MailIcon } from '@mui/icons-material';
import { authService } from '../services/auth.service';
import { getFriendlyError } from '../utils/errorMessages';
import type { RegisterRequestDTO } from '../types/auth.types';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    nombre?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const navigate = useNavigate();

  // Validaciones
  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    if (nombre.length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    }
    
    if (password.length < 8) {
      errors.password = 'Mínimo 8 caracteres (letras y números)';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Debe contener letras y números';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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

      setError(
        getFriendlyError(
          err,
          'No pudimos crear tu cuenta. Verifica tus datos e inténtalo de nuevo.'
        )
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
        radial-gradient(circle at 80% 20%, rgba(158, 141, 173, 0.6) 0%, transparent 45%),
        radial-gradient(circle at 20% 80%, rgba(107, 155, 209, 0.55) 0%, transparent 45%),
        radial-gradient(circle at 90% 60%, rgba(168, 216, 234, 0.4) 0%, transparent 40%),
        linear-gradient(135deg, #F8F9FA 0%, #E8D1E0 50%, #A8D8EA 100%)
      `,
      backgroundAttachment: 'fixed',
      backgroundSize: '200% 200%, 200% 200%, 200% 200%, 100% 100%',
      animation: 'vivoBgMove 6s ease infinite',
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 0 },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 80% 20%, rgba(158, 141, 173, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(107, 155, 209, 0.1) 0%, transparent 50%)
        `,
        animation: 'vivoBgMove 8s ease-in-out infinite reverse',
        backgroundSize: '200% 200%',
        zIndex: 0,
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={12} 
          sx={{ 
            width: '100%',
            overflow: 'hidden',
            animation: 'fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(158, 141, 173, 0.1)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: { xs: 'auto', md: '550px' }
          }}
        >
          {/* LEFT SIDE - BRANDING & INFO */}
          <Box
            sx={{
              flex: 0.6,
              background: `linear-gradient(135deg, #6B9BD1 0%, #9E8DAD 100%)`,
              color: 'white',
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '200px', md: '550px' }
            }}
          >
            <Box>
              <PersonAddIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  letterSpacing: '-0.5px'
                }}
              >
                Únete a Arq-3✿
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.95,
                  lineHeight: 1.6,
                  fontSize: '1.05rem'
                }}
              >
                Comienza a transformar tus ideas arquitectónicas en modelos 3D profesionales con nuestra inteligencia artificial.
              </Typography>
            </Box>

            {/* Benefits List */}
            <Box sx={{ mt: 4 }}>
              <Stack spacing={2}>
                {[
                  { icon: '✿', text: 'Generación modelos 2D y 3D' },
                  { icon: '✿', text: 'Procesamiento rápido' },
                ].map((benefit, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontSize: '1.5rem' }}>{benefit.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {benefit.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* RIGHT SIDE - FORM */}
          <Box
            sx={{
              flex: 1.4,
              p: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: { xs: 'auto', md: '550px' }
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                color: 'text.primary',
                letterSpacing: '-0.5px'
              }}
            >
              Crear Cuenta
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4, fontSize: '1rem' }}
            >
              Completa los campos para comenzar
            </Typography>

            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" variant="filled" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
                ¡Registro exitoso! Llevándote al Login...
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister} noValidate sx={{ width: '100%' }}>
              {/* FILA 1: Nombre y Email */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                {/* Campo Nombre de usuario */}
                <Box>
                  <Typography 
                    component="label"
                    sx={{ 
                      display: 'block',
                      mb: 1, 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Nombre de usuario
                  </Typography>
                  <TextField
                    fullWidth
                    id="nombre"
                    name="nombre"
                    placeholder="tu_nombre"
                    disabled={loading || success}
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (validationErrors.nombre) {
                        setValidationErrors({ ...validationErrors, nombre: undefined });
                      }
                    }}
                    error={!!validationErrors.nombre}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                    size="small"
                  />
                  <FormHelperText sx={{ fontSize: '0.75rem', color: validationErrors.nombre ? 'error.main' : 'text.secondary' }}>
                    {validationErrors.nombre || 'Máximo 50 caracteres'}
                  </FormHelperText>
                </Box>

                {/* Campo Email */}
                <Box>
                  <Typography 
                    component="label"
                    sx={{ 
                      display: 'block',
                      mb: 1, 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: '0.9rem'
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
                    disabled={loading || success}
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
                    size="small"
                  />
                  <FormHelperText sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Usaremos este correo para tu cuenta
                  </FormHelperText>
                </Box>
              </Box>

              {/* FILA 2: Contraseña y Confirmar */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
                {/* Campo Contraseña */}
                <Box>
                  <Typography 
                    component="label"
                    sx={{ 
                      display: 'block',
                      mb: 1, 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: '0.9rem'
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
                    disabled={loading || success}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                      }
                    }}
                    error={!!validationErrors.password}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading || success} size="small">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                    size="small"
                  />
                  <FormHelperText sx={{ fontSize: '0.75rem', color: validationErrors.password ? 'error.main' : 'text.secondary' }}>
                    {validationErrors.password || 'Mínimo 8 caracteres (letras y números)'}
                  </FormHelperText>
                </Box>

                {/* Campo Confirmar Contraseña */}
                <Box>
                  <Typography 
                    component="label"
                    sx={{ 
                      display: 'block',
                      mb: 1, 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Confirmar contraseña
                  </Typography>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="••••••••"
                    disabled={loading || success}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({ ...validationErrors, confirmPassword: undefined });
                      }
                    }}
                    error={!!validationErrors.confirmPassword}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={loading || success} size="small">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                    size="small"
                  />
                  <FormHelperText sx={{ fontSize: '0.75rem', color: validationErrors.confirmPassword ? 'error.main' : 'text.secondary' }}>
                    {validationErrors.confirmPassword || 'Debe coincidir con la contraseña anterior'}
                  </FormHelperText>
                </Box>
              </Box>
              
              <Button
                type="submit" 
                fullWidth 
                variant="contained" 
                color="secondary" 
                size="large"
                disabled={loading || success} 
                sx={{ py: 1.2, fontSize: '1rem', fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  ¿Ya tienes una cuenta?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    underline="hover" 
                    color="primary.main" 
                    sx={{ fontWeight: 700 }}
                  >
                    Inicia sesión
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
