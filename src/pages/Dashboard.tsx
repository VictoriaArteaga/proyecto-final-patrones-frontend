import { Typography, Container, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }} color="primary">
          Panel de Proyectos
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            ¡Bienvenido a Arq-AI 3D!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mt: 2, mb: 2 }}>
            Empieza a transformar tus ideas en realidad. Sube una fotografía de una casa y nuestra IA 
            se encargará de generar un concepto 2D y, tras tu aprobación, un modelo 3D completo.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/new-project')}
            sx={{ mt: 3, px: 4, py: 1.5, borderRadius: 2 }}
          >
            Crear Nuevo Proyecto 3D
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}