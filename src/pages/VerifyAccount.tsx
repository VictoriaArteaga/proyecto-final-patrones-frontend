import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, Paper, CircularProgress, Fade
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  MarkEmailRead as EmailIcon
} from '@mui/icons-material';
import { authService } from '../services/auth.service';

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasCalled = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token || hasCalled.current) return;
      hasCalled.current = true;

      try {
        const response = await authService.verify(token);
        setStatus('success');
        setMessage(response || '¡Cuenta verificada exitosamente!');
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Error al verificar la cuenta. El token podría ser inválido o haber expirado.');
      }
    };

    verify();
  }, [token]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, rgba(213, 0, 249, 0.1) 0%, transparent 40%), radial-gradient(circle at bottom right, rgba(0, 229, 255, 0.1) 0%, transparent 40%)'
    }}>
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper elevation={24} sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            {/* Animated top bar */}
            <Box sx={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', 
              background: 'linear-gradient(90deg, #D500F9, #00E5FF)',
            }} />

            {status === 'loading' && (
              <Box sx={{ py: 4 }}>
                <CircularProgress color="secondary" size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Verificando cuenta...</Typography>
                <Typography variant="body1" color="text.secondary">Estamos procesando tu solicitud, un momento por favor.</Typography>
              </Box>
            )}

            {status === 'success' && (
              <Box sx={{ py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                  ¡Todo listo!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                  {message}
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2, 
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 20px rgba(213, 0, 249, 0.3)'
                  }}
                >
                  Ir al Inicio de Sesión
                </Button>
              </Box>
            )}

            {status === 'error' && (
              <Box sx={{ py: 2 }}>
                <ErrorIcon color="error" sx={{ fontSize: 80, mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                  Hubo un problema
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                  {message}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/register')}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Volver al Registro
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                Arq-AI 3D Security System
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
