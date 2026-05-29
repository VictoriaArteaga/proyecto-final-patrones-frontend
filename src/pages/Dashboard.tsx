import { Typography, Container, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 100px)',
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
      overflow: 'hidden',
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
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }} color="primary.main">
            Panel de Proyectos
          </Typography>
          
          {/* Aqui se listaran los proyectos proximamente */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No tienes proyectos activos todavia. Comienza creando uno nuevo en la barra lateral.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}