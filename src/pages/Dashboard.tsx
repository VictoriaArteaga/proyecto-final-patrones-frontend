import { Typography, Container, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Container maxWidth="lg">
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
  );
}