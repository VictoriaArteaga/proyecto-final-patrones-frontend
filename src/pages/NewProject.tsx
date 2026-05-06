import { useState, useRef } from 'react';
import { 
  Box, Container, Typography, Paper, Stepper, Step, StepLabel, 
  Button, TextField, CircularProgress, Alert, Card, CardMedia
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { projectService } from '../services/project.service';
import type { ProjectResponseDTO } from '../types/project.types';

const steps = ['Subir Fotografía', 'Revisar Render 2D', 'Generar Modelo 3D'];

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
      // 1. Crear proyecto con imagen
      const createdProject = await projectService.createProject(selectedFile, projectName);
      setProject(createdProject);
      
      // 2. Generar 2D
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
      
      // Iniciar polling
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
    }, 5000); // Poll cada 5 segundos
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Generador de Casa 3D
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6, mt: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* STEP 0: UPLOAD */}
        {activeStep === 0 && (
          <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
            />
            
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ py: 2, mb: 3, borderStyle: 'dashed', borderWidth: 2 }}
              disabled={loading}
            >
              {selectedFile ? selectedFile.name : 'Seleccionar Fotografía de la Casa'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleCreateAndGenerate2D}
              disabled={loading || !selectedFile || !projectName}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generar Concepto 2D'}
            </Button>
          </Box>
        )}

        {/* STEP 1: APPROVE 2D */}
        {activeStep === 1 && project && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Revisa el concepto generado por la IA 2D
            </Typography>
            
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4, mt: 2, boxShadow: 3 }}>
              {project.image2DUrl ? (
                <CardMedia
                  component="img"
                  height="400"
                  image={project.image2DUrl}
                  alt="Render 2D"
                  sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                />
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography color="text.secondary">Imagen no disponible</Typography>
                </Box>
              )}
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleReject2D}
                disabled={loading}
                sx={{ px: 4 }}
              >
                Rechazar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleApprove2D}
                disabled={loading}
                sx={{ px: 4 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Aprobar Diseño'}
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 2: GENERATE 3D */}
        {activeStep === 2 && project && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Diseño aprobado. ¡Listo para la magia en 3D!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Nuestra segunda IA tomará el concepto 2D y construirá un modelo 3D detallado.
              Este proceso puede tomar varios minutos.
            </Typography>

            {!project.model3DUrl && !loading && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGenerate3D}
                sx={{ px: 6, py: 1.5 }}
              >
                Iniciar Generación 3D
              </Button>
            )}

            {loading && (
              <Box sx={{ mt: 4 }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="body1" color="primary">
                  Procesando modelo 3D... por favor espera.
                </Typography>
              </Box>
            )}

            {project.model3DUrl && (
              <Box sx={{ mt: 4 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  ¡El modelo 3D está listo para descargarse!
                </Alert>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  href={project.model3DUrl} 
                  target="_blank"
                  size="large"
                >
                  Descargar Modelo 3D (.glb)
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
