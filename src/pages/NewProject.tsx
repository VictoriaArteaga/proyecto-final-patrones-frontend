import { useState, useRef } from 'react';
import { 
  Box, Container, Typography, Stepper, Step, StepLabel, 
  Button, TextField, CircularProgress, Alert, Card, CardMedia, CardContent, StepConnector, stepConnectorClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload as CloudUploadIcon, Check as CheckIcon, Close as CloseIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { projectService } from '../services/project.service';
import type { ProjectResponseDTO } from '../types/project.types';

const steps = ['Subir Fotografía', 'Revisar Render 2D', 'Generar Modelo 3D'];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #00E5FF 0%, #D500F9 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #00E5FF 0%, #D500F9 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

export default function NewProject() {
  const [activeStep, setActiveStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateAndGenerate2D = async () => {
    if (!projectName || !selectedFile) {
      setError('Por favor ingresa un nombre y selecciona una imagen.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const createdProject = await projectService.createProject(selectedFile, projectName);
      setProject(createdProject);
      
      const projectWith2D = await projectService.generate2D(createdProject.id);
      setProject(projectWith2D);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove2D = async () => {
    if (!project) return;
    setError('');
    setLoading(true);
    try {
      const approvedProject = await projectService.approveProject(project.id);
      setProject(approvedProject);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar el diseño.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject2D = async () => {
    if (!project) return;
    setError('');
    setLoading(true);
    try {
      await projectService.rejectProject(project.id);
      setError('El diseño fue rechazado. Intenta subir otra imagen.');
      setActiveStep(0);
      setProject(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar el diseño.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate3D = async () => {
    if (!project) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await projectService.generate3D(project.id);
      setSuccess('¡Generación 3D iniciada! El proceso está corriendo en segundo plano.');
      
      pollProjectStatus(project.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar la generación 3D.');
      setLoading(false);
    }
  };

  const pollProjectStatus = (projectId: string) => {
    const interval = setInterval(async () => {
      try {
        const updatedProject = await projectService.getProject(projectId);
        setProject(updatedProject);
        
        if (updatedProject.model3DUrl) {
          clearInterval(interval);
          setLoading(false);
          setSuccess('¡Modelo 3D generado con éxito!');
        } else if (updatedProject.status === 'ERROR') {
          clearInterval(interval);
          setLoading(false);
          setError('Error durante la generación 3D.');
        }
      } catch (err) {
        console.error('Error polling project status', err);
      }
    }, 5000);
  };

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4, overflow: 'visible', animation: 'fadeIn 0.8s ease-out forwards' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, gap: 1 }}>
            <AutoAwesomeIcon color="secondary" sx={{ animation: 'float 3s ease-in-out infinite' }} />
            <Typography variant="h4" align="center" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Generador de Casa 3D
            </Typography>
            <AutoAwesomeIcon color="primary" sx={{ animation: 'float 3s ease-in-out infinite reverse' }} />
          </Box>
          
          <Stepper activeStep={activeStep} alternativeLabel connector={<CustomConnector />} sx={{ mb: 6, mt: 5 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  slotProps={{
                    stepIcon: {
                      sx: {
                        '&.Mui-active': { color: '#D500F9' },
                        '&.Mui-completed': { color: '#00E5FF' },
                      }
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: activeStep === index ? 700 : 400 }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{success}</Alert>}

          {/* STEP 0: UPLOAD */}
          {activeStep === 0 && (
            <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
              <TextField
                fullWidth
                label="Nombre del Proyecto"
                variant="outlined"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                sx={{ mb: 4 }}
                disabled={loading}
              />
              
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <Box 
                onClick={() => !loading && fileInputRef.current?.click()}
                sx={{ 
                  border: '2px dashed',
                  borderColor: selectedFile ? 'primary.main' : 'rgba(255,255,255,0.2)',
                  borderRadius: 4,
                  p: 5,
                  mb: 4,
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.3s',
                  bgcolor: selectedFile ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
                  '&:hover': {
                    borderColor: loading ? '' : 'primary.main',
                    bgcolor: loading ? '' : 'rgba(0, 229, 255, 0.05)'
                  }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 60, color: selectedFile ? 'primary.main' : 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color={selectedFile ? 'text.primary' : 'text.secondary'} gutterBottom>
                  {selectedFile ? selectedFile.name : 'Haz clic para subir una fotografía'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Formatos soportados: JPG, PNG, WEBP
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleCreateAndGenerate2D}
                disabled={loading || !selectedFile || !projectName}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : 'Generar Concepto 2D'}
              </Button>
            </Box>
          )}

          {/* STEP 1: APPROVE 2D */}
          {activeStep === 1 && project && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Revisa el concepto generado por la IA 2D
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Nuestra IA ha interpretado tu imagen y generado esta propuesta arquitectónica.
              </Typography>
              
              <Box sx={{ 
                maxWidth: 600, mx: 'auto', mb: 5, 
                borderRadius: 4, overflow: 'hidden', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(0,0,0,0.2)'
              }}>
                {project.image2DUrl ? (
                  <CardMedia
                    component="img"
                    height="400"
                    image={project.image2DUrl}
                    alt="Render 2D"
                    sx={{ objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Imagen no disponible</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={handleReject2D}
                  disabled={loading}
                  sx={{ px: 4, py: 1.5, borderRadius: 12, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Rechazar
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleApprove2D}
                  disabled={loading}
                  sx={{ px: 4, py: 1.5, background: 'linear-gradient(45deg, #00C853 30%, #69F0AE 90%)', color: '#000' }}
                >
                  {loading ? <CircularProgress size={26} color="inherit" /> : 'Aprobar Diseño'}
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 2: GENERATE 3D */}
          {activeStep === 2 && project && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Diseño aprobado. ¡Listo para la magia en 3D!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                Nuestra segunda IA tomará el concepto 2D y construirá un modelo 3D detallado.
                Este proceso requiere un alto poder de cómputo y puede tomar varios minutos.
              </Typography>

              {!project.model3DUrl && !loading && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGenerate3D}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{ px: 6, py: 2, fontSize: '1.2rem', borderRadius: 12 }}
                >
                  Iniciar Generación 3D
                </Button>
              )}

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={80} thickness={4} sx={{ mb: 4, color: 'secondary.main' }} />
                  <Typography variant="h6" color="primary">
                    Procesando modelo 3D... por favor espera.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Nuestros servidores están trabajando en tu diseño.
                  </Typography>
                </Box>
              )}

              {project.model3DUrl && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h6">¡El modelo 3D está listo para descargarse!</Typography>
                  </Alert>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    href={project.model3DUrl} 
                    target="_blank"
                    size="large"
                    sx={{ px: 6, py: 2, fontSize: '1.2rem' }}
                  >
                    Descargar Modelo 3D (.glb)
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
