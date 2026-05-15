import { Typography, Container, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, Architecture as ArchitectureIcon } from '@mui/icons-material';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }} color="primary.main">
          Panel de Proyectos
        </Typography>
        
        {/* Aquí se listarán los proyectos próximamente */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No tienes proyectos activos todavía. Comienza creando uno nuevo en la barra lateral.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}