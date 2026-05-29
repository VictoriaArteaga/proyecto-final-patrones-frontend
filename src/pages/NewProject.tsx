import { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';

import { styled } from '@mui/material/styles';

import {
  CloudUpload as CloudUploadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  Apartment as ApartmentIcon,
  Weekend as WeekendIcon,
  Chair as ChairIcon,
} from '@mui/icons-material';

import { projectService } from '../services/project.service';
import type {
  DesignCategory,
  ProjectResponseDTO,
} from '../types/project.types';

const steps = [
  'Subir Fotografía',
  'Revisar Render 2D',
  'Generar Modelo 3D',
];

// Categorías de diseño disponibles en el backend (enum DesignCategory).
const categories: {
  value: DesignCategory;
  title: string;
  description: string;
  icon: typeof ApartmentIcon;
}[] = [
  {
    value: 'EXTERIOR_ARCHITECTURE',
    title: 'Arquitectura Exterior',
    description: 'Casas, edificios o estructuras sobre un terreno.',
    icon: ApartmentIcon,
  },
  {
    value: 'INTERIOR_ROOM',
    title: 'Espacio Interior',
    description: 'Rediseño de una sala, cuarto o cocina completa.',
    icon: WeekendIcon,
  },
  {
    value: 'FURNITURE_ITEM',
    title: 'Mueble u Objeto',
    description: 'Inserción de un mueble u objeto puntual en una foto.',
    icon: ChairIcon,
  },
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },

  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #6B9BD1 0%, #9E8DAD 100%)',
    },
  },

  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #A8D8EA 0%, #E8D1E0 100%)',
    },
  },

  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'light'
        ? '#E0E0E0'
        : '#eaeaf0',
    borderRadius: 1,
  },
}));

export default function NewProject() {
  const [activeStep, setActiveStep] = useState(0);

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  const [category, setCategory] =
    useState<DesignCategory | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [project, setProject] =
    useState<ProjectResponseDTO | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================
  // FILE CHANGE
  // =========================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // =========================
  // CREATE + GENERATE 2D
  // =========================
  const handleCreateAndGenerate2D = async () => {
    if (!projectName || !category || !selectedFile) {
      setError(
        'Por favor ingresa un nombre, elige una categoría y selecciona una imagen.'
      );
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('1. Creando proyecto...');

      // PASO 1: CREAR PROYECTO
      const createdProject = await projectService.createProject(
        selectedFile,
        projectName,
        category
      );

      console.log('Proyecto creado:', createdProject);

      setProject(createdProject);

      // PASO 2: GENERAR 2D
      console.log('2. Generando render 2D...');

      const projectWith2D =
        await projectService.generate2D(
          createdProject.id,
          description
        );

      console.log('Render 2D generado:', projectWith2D);

      setProject(projectWith2D);

      setSuccess('Render 2D generado correctamente.');

      setActiveStep(1);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Error al procesar la imagen.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // APPROVE 2D
  // =========================
  const handleApprove2D = async () => {
    if (!project) return;

    setError('');
    setLoading(true);

    try {
      const approvedProject =
        await projectService.approveProject(project.id);

      setProject(approvedProject);

      setActiveStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al aprobar el diseño.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REJECT 2D
  // =========================
  const handleReject2D = async () => {
    if (!project) return;

    setError('');
    setLoading(true);

    try {
      await projectService.rejectProject(project.id);

      setError(
        'El diseño fue rechazado. Intenta subir otra imagen.'
      );

      setActiveStep(0);

      setProject(null);

      setSelectedFile(null);

      setDescription('');

      setProjectName('');

      setCategory(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al rechazar el diseño.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GENERATE 3D
  // =========================
  const handleGenerate3D = async () => {
    if (!project) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await projectService.generate3D(project.id);

      setSuccess(
        '¡Generación 3D iniciada! El proceso está corriendo en segundo plano.'
      );

      pollProjectStatus(project.id);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al iniciar la generación 3D.'
      );

      setLoading(false);
    }
  };

  // =========================
  // POLLING
  // =========================
  const pollProjectStatus = (projectId: string) => {
    const interval = setInterval(async () => {
      try {
        const updatedProject =
          await projectService.getProject(projectId);

        setProject(updatedProject);

        if (updatedProject.model3DUrl) {
          clearInterval(interval);

          setLoading(false);

          setSuccess('¡Modelo 3D generado con éxito!');
        }

        if (
          updatedProject.status === 'FAILED' ||
          updatedProject.status === 'ERROR'
        ) {
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
      <Card
        sx={{
          mt: 4,
          overflow: 'visible',
          animation: 'fadeIn 0.8s ease-out forwards',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* HEADER */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              gap: 1,
            }}
          >
            <AutoAwesomeIcon
              color="secondary"
              sx={{
                animation: 'float 3s ease-in-out infinite',
              }}
            />

            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
              }}
            >
              Generador de Casa 3D
            </Typography>

            <AutoAwesomeIcon
              color="primary"
              sx={{
                animation:
                  'float 3s ease-in-out infinite reverse',
              }}
            />
          </Box>

          {/* STEPPER */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<CustomConnector />}
            sx={{ mb: 6, mt: 5 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  slotProps={{
                    stepIcon: {
                      sx: {
                        '&.Mui-active': {
                          color: '#9E8DAD',
                        },

                        '&.Mui-completed': {
                          color: '#6B9BD1',
                        },
                      },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight:
                        activeStep === index ? 700 : 400,
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* ALERTS */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 4,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 4,
                borderRadius: 2,
              }}
            >
              {success}
            </Alert>
          )}

          {/* ========================= */}
          {/* STEP 0 */}
          {/* ========================= */}
          {activeStep === 0 && (
            <Box
              sx={{
                maxWidth: 500,
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              {/* CATEGORY SELECTOR */}
              <Typography
                variant="h6"
                align="left"
                sx={{ mb: 0.5, fontWeight: 700 }}
              >
                ¿Qué deseas generar?
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                align="left"
                sx={{ mb: 2.5 }}
              >
                Elige la categoría de diseño para tu proyecto.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                  mb: 4,
                }}
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.value;

                  return (
                    <Box
                      key={cat.value}
                      onClick={() =>
                        !loading && setCategory(cat.value)
                      }
                      sx={{
                        textAlign: 'center',
                        p: 2.5,
                        height: '100%',
                        borderRadius: 4,
                        cursor: loading ? 'default' : 'pointer',
                        transition: 'all 0.3s',

                        border: '2px solid',
                        borderColor: selected
                          ? 'primary.main'
                          : 'rgba(107, 155, 209, 0.2)',

                        bgcolor: selected
                          ? 'rgba(107, 155, 209, 0.08)'
                          : 'transparent',

                        boxShadow: selected
                          ? '0 6px 18px rgba(44, 74, 109, 0.12)'
                          : 'none',

                        '&:hover': {
                          borderColor: loading
                            ? ''
                            : 'primary.main',
                          transform: loading
                            ? 'none'
                            : 'translateY(-3px)',
                        },
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 42,
                          mb: 1,
                          color: selected
                            ? 'primary.main'
                            : 'text.secondary',
                        }}
                      />

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: selected
                            ? 'primary.dark'
                            : 'text.primary',
                        }}
                      >
                        {cat.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {cat.description}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* PROJECT NAME */}
              <TextField
                fullWidth
                label="Nombre del Proyecto"
                variant="outlined"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                sx={{ mb: 3 }}
                disabled={loading}
              />

              {/* DESCRIPTION */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe la casa que deseas generar"
                placeholder="Ejemplo: Casa moderna de 4 pisos con piscina, grandes ventanales y jardín."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                sx={{ mb: 4 }}
                disabled={loading}
              />

              {/* FILE INPUT */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {/* DROPZONE */}
              <Box
                onClick={() =>
                  !loading &&
                  fileInputRef.current?.click()
                }
                sx={{
                  border: '2px dashed',
                  borderColor: selectedFile
                    ? 'primary.main'
                    : 'rgba(107, 155, 209, 0.3)',

                  borderRadius: 4,

                  p: 5,

                  mb: 4,

                  cursor: loading
                    ? 'default'
                    : 'pointer',

                  transition: 'all 0.3s',

                  bgcolor: selectedFile
                    ? 'rgba(107, 155, 209, 0.05)'
                    : 'transparent',

                  '&:hover': {
                    borderColor: loading
                      ? ''
                      : 'primary.main',

                    bgcolor: loading
                      ? ''
                      : 'rgba(107, 155, 209, 0.08)',
                  },
                }}
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: 60,
                    color: selectedFile
                      ? 'primary.main'
                      : 'text.secondary',
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h6"
                  color={
                    selectedFile
                      ? 'text.primary'
                      : 'text.secondary'
                  }
                  gutterBottom
                >
                  {selectedFile
                    ? selectedFile.name
                    : 'Haz clic para subir una fotografía'}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Formatos soportados: JPG y PNG
                </Typography>
              </Box>

              {/* BUTTON */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleCreateAndGenerate2D}
                disabled={
                  loading ||
                  !selectedFile ||
                  !projectName ||
                  !category
                }
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={26}
                    color="inherit"
                  />
                ) : (
                  'Generar Concepto 2D'
                )}
              </Button>
            </Box>
          )}

          {/* ========================= */}
          {/* STEP 1 */}
          {/* ========================= */}
          {activeStep === 1 && project && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Revisa el concepto generado por la IA 2D
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Nuestra IA ha interpretado tu imagen y
                generado esta propuesta arquitectónica.
              </Typography>

              <Box
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  mb: 5,

                  borderRadius: 4,

                  overflow: 'hidden',

                  boxShadow:
                    '0 8px 32px rgba(44, 74, 109, 0.15)',

                  border:
                    '1px solid rgba(107, 155, 209, 0.2)',

                  bgcolor: '#F8F9FA',
                }}
              >
                {project.image2DUrl ? (
                  <CardMedia
                    component="img"
                    height="400"
                    image={project.image2DUrl}
                    alt="Render 2D"
                    sx={{ objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography color="text.secondary">
                      Imagen no disponible
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={handleReject2D}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 12,
                    borderWidth: 2,

                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Rechazar
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleApprove2D}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,

                    background:
                      'linear-gradient(45deg, #00C853 30%, #69F0AE 90%)',

                    color: '#000',
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={26}
                      color="inherit"
                    />
                  ) : (
                    'Aprobar Diseño'
                  )}
                </Button>
              </Box>
            </Box>
          )}

          {/* ========================= */}
          {/* STEP 2 */}
          {/* ========================= */}
          {activeStep === 2 && project && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                Diseño aprobado. ¡Listo para la magia en
                3D!
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 6,
                  maxWidth: 600,
                  mx: 'auto',
                  fontWeight: 400,
                }}
              >
                Nuestra segunda IA tomará el concepto 2D y
                construirá un modelo 3D detallado.
              </Typography>

              {!project.model3DUrl && !loading && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGenerate3D}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 12,
                  }}
                >
                  Iniciar Generación 3D
                </Button>
              )}

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress
                    size={80}
                    thickness={4}
                    sx={{
                      mb: 4,
                      color: 'secondary.main',
                    }}
                  />

                  <Typography
                    variant="h6"
                    color="primary"
                  >
                    Procesando modelo 3D...
                  </Typography>
                </Box>
              )}

              {project.model3DUrl && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity="success"
                    sx={{
                      mb: 4,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">
                      ¡El modelo 3D está listo!
                    </Typography>
                  </Alert>

                  <Button
                    variant="contained"
                    color="primary"
                    href={project.model3DUrl}
                    target="_blank"
                    size="large"
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                    }}
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