import { Typography, Container, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Panel de Proyectos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ¡Bienvenido! Aquí conectaremos tu ProjectController muy pronto.
        </Typography>
      </Box>
    </Container>
  );
}