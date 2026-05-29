import { useState, useRef, useEffect } from 'react';
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
import { getFriendlyError } from '../utils/errorMessages';
import { ACTIVE_PROJECT_KEY } from '../utils/storageKeys';
import type {
  DesignCategory,
  ProjectResponseDTO,
} from '../types/project.types';
import ModelViewer from '../components/ModelViewer';

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
  color: string;
  promptLabel: string;
  promptPlaceholder: string;
}[] = [
  {
    value: 'EXTERIOR_ARCHITECTURE',
    title: 'Arquitectura Exterior',
    description: 'Casas y edificios',
    icon: ApartmentIcon,
    color: '#6B9BD1', // lightBlue
    promptLabel: 'Describe la casa o edificio que deseas generar',
    promptPlaceholder:
      'Ej: Casa moderna de 4 pisos con piscina, grandes ventanales y jardín.',
  },
  {
    value: 'INTERIOR_ROOM',
    title: 'Espacio Interior',
    description: 'Salas, cuartos, cocinas',
    icon: WeekendIcon,
    color: '#9E8DAD', // softPurple
    promptLabel: 'Describe el espacio interior que deseas generar',
    promptPlaceholder:
      'Ej: Sala estilo escandinavo, tonos claros, sofá gris y plantas.',
  },
  {
    value: 'FURNITURE_ITEM',
    title: 'Mueble u Objeto',
    description: 'Muebles y objetos',
    icon: ChairIcon,
    color: '#2C4A6D', // darkBlue
    promptLabel: 'Describe el mueble u objeto que deseas generar',
    promptPlaceholder:
      'Ej: Estantería de madera clara de 3 niveles, estilo minimalista.',
  },
];

// Estados del backend en los que la IA está trabajando (hay que hacer polling).
const GENERATING_STATES = [
  'GENERATING_2D',
  'GENERATING_2D_WITH_PARAMS',
  'GENERATING_3D_MODEL',
];

const isGenerating = (status?: string | null): boolean =>
  !!status && GENERATING_STATES.includes(status);

// Mapea el estado persistido del backend al paso visible del Stepper.
const stepForStatus = (status?: string | null): number => {
  switch (status) {
    case 'IMAGE_UPLOADED':
    case 'GENERATING_2D':
      return 0;
    case 'WAITING_2D_APPROVAL':
    case 'REJECTED_2D':
    case 'GENERATING_2D_WITH_PARAMS':
      return 1;
    case 'WAITING_FINAL_APPROVAL':
    case 'GENERATING_3D_MODEL':
    case 'COMPLETED':
      return 2;
    default:
      return 0;
  }
};

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
  // REANUDAR PROYECTO EN CURSO 
  // =========================
  // Si dejamos un proyecto a medias (en otra pestaña/recarga), lo recuperamos
  // del backend, que es la fuente de verdad: persiste status, image2DUrl y model3DUrl.
  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!savedId) return;

    let cancelled = false;

    (async () => {
      try {
        const saved = await projectService.getProject(savedId);

        if (cancelled) return;

        if (saved.status === 'DELETED') {
          localStorage.removeItem(ACTIVE_PROJECT_KEY);
          return;
        }

        setProject(saved);
        setActiveStep(stepForStatus(saved.status));
      } catch (err) {
        console.error('No se pudo reanudar el proyecto guardado', err);
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // POLLING REACTIVO AL ESTADO
  // =========================
  // Mientras el proyecto esté en un estado de "generando" y no haya modelo 3D,
  // consultamos el backend cada 5s. El intervalo se limpia solo al desmontar o
  // al cambiar el estado, así no se duplica ni queda colgado.
  useEffect(() => {
    if (!project) return;

    const stillGenerating =
      isGenerating(project.status) && !project.model3DUrl;

    if (!stillGenerating) return;

    setLoading(true);

    const interval = setInterval(async () => {
      try {
        const updated = await projectService.getProject(project.id);

        setProject(updated);

        if (updated.model3DUrl) {
          setActiveStep(2);
          setLoading(false);
          setSuccess('¡Tu modelo 3D ya está listo!');
        } else if (updated.status === 'WAITING_2D_APPROVAL') {
          setActiveStep(1);
          setLoading(false);
          setSuccess('¡Tu diseño 2D ya está listo! Revísalo abajo.');
        } else if (
          updated.status === 'FAILED' ||
          updated.status === 'ERROR'
        ) {
          setLoading(false);
          setError(
            'No pudimos completar la generación. Por favor, inténtalo de nuevo.'
          );
        }
      } catch (err) {
        console.error('Error consultando el estado del proyecto', err);
      }
    }, 5000);

    return () => clearInterval(interval);
    // Solo reiniciamos el intervalo cuando cambia el proyecto, su estado
    // o aparece el modelo 3D.
  }, [project?.id, project?.status, project?.model3DUrl]);

  // =========================
  // REINICIAR FLUJO (nuevo proyecto)
  // =========================
  const resetFlow = () => {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
    setProject(null);
    setActiveStep(0);
    setSelectedFile(null);
    setProjectName('');
    setDescription('');
    setCategory(null);
    setError('');
    setSuccess('');
    setLoading(false);
  };

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

      // Recordamos el proyecto para poder reanudarlo si cambiamos de ventana.
      localStorage.setItem(ACTIVE_PROJECT_KEY, createdProject.id);

      // PASO 2: GENERAR 2D
      console.log('2. Generando render 2D...');

      const projectWith2D =
        await projectService.generate2D(
          createdProject.id,
          description
        );

      console.log('Render 2D generado:', projectWith2D);

      setProject(projectWith2D);

      setSuccess('¡Tu diseño 2D ya está listo! Revísalo abajo.');

      setActiveStep(1);
    } catch (err: any) {
      console.error(err);

      setError(
        getFriendlyError(
          err,
          'No pudimos procesar tu imagen. Revisa que sea JPG o PNG e inténtalo de nuevo.'
        )
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
        getFriendlyError(err, 'No pudimos aprobar el diseño. Inténtalo de nuevo.')
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

      // Limpiamos el flujo y el proyecto guardado: empezamos de cero.
      resetFlow();

      setError(
        'Descartaste el diseño. Sube otra imagen para intentarlo de nuevo.'
      );
    } catch (err: any) {
      setError(
        getFriendlyError(err, 'No pudimos descartar el diseño. Inténtalo de nuevo.')
      );
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
      const updated = await projectService.generate3D(project.id);

      // Al pasar a GENERATING_3D_MODEL, el effect de polling arranca solo
      // y sigue aunque cambies de ventana (el estado vive en el backend).
      setProject(updated);

      setSuccess(
        'Estamos creando tu modelo 3D. Esto puede tardar un poco; puedes seguir usando la app y aquí verás el resultado al terminar.'
      );
    } catch (err: any) {
      setError(
        getFriendlyError(
          err,
          'No pudimos iniciar la creación del modelo 3D. Inténtalo de nuevo.'
        )
      );

      setLoading(false);
    }
  };

  const selectedCategory =
    categories.find((c) => c.value === category) ?? null;

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
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
      overflow: 'auto',
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
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
      <Card
        sx={{
          mt: 4,
          overflow: 'visible',
          animation: 'fadeIn 0.8s ease-out forwards',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
              Generador 3D
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
          {/* STEP 0 - GENERANDO (al reanudar) */}
          {/* ========================= */}
          {activeStep === 0 &&
            project &&
            isGenerating(project.status) && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{ mb: 4, color: 'primary.main' }}
                />

                <Typography variant="h6" color="primary">
                  Generando tu render 2D...
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Puedes cambiar de ventana; el proceso continúa y
                  se mostrará aquí al terminar.
                </Typography>
              </Box>
            )}

          {/* ========================= */}
          {/* STEP 0 - FORMULARIO */}
          {/* ========================= */}
          {activeStep === 0 &&
            !(project && isGenerating(project.status)) && (
            <Box
              sx={{
                maxWidth: 640,
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
                  gap: 1.5,
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
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        textAlign: 'left',
                        px: 1.75,
                        py: 1.25,
                        borderRadius: 3,
                        cursor: loading ? 'default' : 'pointer',
                        transition: 'all 0.25s',

                        border: '2px solid',
                        borderColor: selected
                          ? cat.color
                          : 'rgba(107, 155, 209, 0.2)',

                        bgcolor: selected
                          ? `${cat.color}14`
                          : 'transparent',

                        boxShadow: selected
                          ? `0 4px 14px ${cat.color}33`
                          : 'none',

                        '&:hover': {
                          borderColor: loading ? '' : cat.color,
                          bgcolor: loading
                            ? ''
                            : `${cat.color}0D`,
                        },
                      }}
                    >
                      {/* ICON CHIP */}
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${cat.color}1F`,
                          color: cat.color,
                        }}
                      >
                        <Icon sx={{ fontSize: 22 }} />
                      </Box>

                      {/* TEXT */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: selected
                              ? cat.color
                              : 'text.primary',
                          }}
                        >
                          {cat.title}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', lineHeight: 1.2 }}
                        >
                          {cat.description}
                        </Typography>
                      </Box>
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
                slotProps={{
                  htmlInput: { maxLength: 30 },
                  formHelperText: { sx: { textAlign: 'right', mr: 0 } },
                }}
                helperText={`${projectName.length}/30`}
                sx={{ mb: 3 }}
                disabled={loading}
              />

              {/* DESCRIPTION */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  selectedCategory
                    ? selectedCategory.promptLabel
                    : 'Describe lo que deseas generar'
                }
                placeholder={
                  selectedCategory
                    ? selectedCategory.promptPlaceholder
                    : 'Primero elige una categoría arriba.'
                }
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                slotProps={{
                  htmlInput: { maxLength: 300 },
                  formHelperText: { sx: { textAlign: 'right', mr: 0 } },
                }}
                helperText={`${description.length}/300`}
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
                    sx={{ mb: 3 }}
                  >
                    Procesando modelo 3D...
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      localStorage.removeItem(ACTIVE_PROJECT_KEY);
                      resetFlow();
                    }}
                  >
                    Cancelar y crear nuevo proyecto
                  </Button>
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

                  <Box sx={{ width: '100%', mb: 4 }}>
                    <ModelViewer
                      modelUrl={project.model3DUrl}
                      backgroundImageUrl={project.imageOriginalUrl || ''}
                    />
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      href={project.model3DUrl}
                      target="_blank"
                      size="large"
                      sx={{ px: 4, py: 1.25 }}
                    >
                      Descargar Modelo (.glb)
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={resetFlow}
                      size="large"
                      sx={{ px: 4, py: 1.25 }}
                    >
                      Crear nuevo proyecto
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}