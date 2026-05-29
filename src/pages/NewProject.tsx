import { useState, useRef, useEffect, useMemo } from 'react';
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
import { useNotifications } from '../context/NotificationsContext';
import type {
  DesignCategory,
  ProjectResponseDTO,
  ProjectParametersInput,
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

// Campos que habilita cada categoría al refinar (coinciden con los validadores
// y prompt builders del backend para cada DesignCategory).
type ParamFieldType = 'text' | 'number' | 'int' | 'list';

interface ParamField {
  key: keyof ProjectParametersInput;
  label: string;
  type: ParamFieldType;
  required?: boolean;
  placeholder?: string;
}

const CATEGORY_PARAM_FIELDS: Record<DesignCategory, ParamField[]> = {
  EXTERIOR_ARCHITECTURE: [
    { key: 'constructionType', label: 'Tipo de construcción', type: 'text', placeholder: 'Ej: casa familiar, edificio de oficinas' },
    { key: 'color', label: 'Color predominante', type: 'text', placeholder: 'Ej: blanco con detalles en madera' },
    { key: 'numberOfFloors', label: 'Número de pisos', type: 'int' },
    { key: 'numberOfRooms', label: 'Número de habitaciones', type: 'int' },
    { key: 'numberOfBathrooms', label: 'Número de baños', type: 'int' },
    { key: 'lotWidth', label: 'Ancho del lote (m)', type: 'number' },
    { key: 'lotLength', label: 'Largo del lote (m)', type: 'number' },
    { key: 'totalArea', label: 'Área total (m²)', type: 'number' },
    { key: 'additionalElements', label: 'Elementos adicionales', type: 'list', placeholder: 'Separados por coma: piscina, jardín, garaje' },
  ],
  INTERIOR_ROOM: [
    { key: 'roomType', label: 'Tipo de espacio', type: 'text', required: true, placeholder: 'Ej: sala, cuarto, cocina' },
    { key: 'styleTrend', label: 'Estilo o tendencia', type: 'text', placeholder: 'Ej: escandinavo, industrial, minimalista' },
    { key: 'color', label: 'Paleta de color', type: 'text', placeholder: 'Ej: tonos tierra y crema' },
    { key: 'materials', label: 'Materiales', type: 'text', placeholder: 'Ej: madera, tela, metal' },
    { key: 'additionalElements', label: 'Elementos adicionales', type: 'list', placeholder: 'Separados por coma: plantas, alfombra, cuadros' },
  ],
  FURNITURE_ITEM: [
    { key: 'furnitureType', label: 'Tipo de mueble u objeto', type: 'text', required: true, placeholder: 'Ej: estantería, sofá, mesa, lámpara' },
    { key: 'materials', label: 'Materiales', type: 'text', placeholder: 'Ej: madera clara, metal' },
    { key: 'color', label: 'Color', type: 'text', placeholder: 'Ej: gris, natural' },
    { key: 'styleTrend', label: 'Estilo', type: 'text', placeholder: 'Ej: minimalista, rústico' },
    { key: 'placement', label: 'Ubicación en la escena', type: 'text', placeholder: 'Ej: junto a la ventana' },
    { key: 'furnitureWidthCm', label: 'Ancho (cm)', type: 'number' },
    { key: 'furnitureHeightCm', label: 'Alto (cm)', type: 'number' },
    { key: 'furnitureDepthCm', label: 'Profundidad (cm)', type: 'number' },
  ],
};

// Construye filas (etiqueta + valor) de los parámetros que SÍ tienen valor,
// para mostrarlos junto a la imagen regenerada.
const buildUsedParamRows = (
  category: DesignCategory | null,
  parameters: any
): { label: string; value: string }[] => {
  if (!category || !parameters) return [];
  const rows: { label: string; value: string }[] = [];
  for (const f of CATEGORY_PARAM_FIELDS[category]) {
    const v = parameters[f.key];
    if (
      v === null ||
      v === undefined ||
      v === '' ||
      (Array.isArray(v) && v.length === 0)
    )
      continue;
    rows.push({
      label: f.label,
      value: Array.isArray(v) ? v.join(', ') : String(v),
    });
  }
  return rows;
};

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

  const { addNotification } = useNotifications();

  // Marca que el usuario detuvo la generación 3D (para mostrar "Reanudar").
  const [cancelled3D, setCancelled3D] = useState(false);

  // Parámetros del formulario de refinamiento (cuando el diseño es rechazado).
  const [params, setParams] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create an Object URL from the uploaded file for the 3D background
  const backgroundImageUrl = useMemo(() => {
    if (project?.imageOriginalUrl) {
      return project.imageOriginalUrl;
    }
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return '';
  }, [selectedFile, project?.imageOriginalUrl]);

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

        // Si la generación falló: si ya hay diseño 2D, lo dejamos en el paso 3D
        // para poder reintentar; si no, vuelve al inicio.
        if (saved.status === 'FAILED') {
          setActiveStep(saved.image2DUrl ? 2 : 0);
          setError(
            'La generación anterior no se completó. Puedes intentarlo de nuevo.'
          );
        } else {
          setActiveStep(stepForStatus(saved.status));
        }
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

    // Tolera fallos transitorios de red, pero se rinde tras varios seguidos
    // (p. ej. si el backend se cae o no responde) en vez de reintentar para siempre.
    let consecutiveFailures = 0;
    const MAX_FAILURES = 4;

    const interval = setInterval(async () => {
      try {
        const updated = await projectService.getProject(project.id);

        consecutiveFailures = 0; // hubo respuesta válida

        setProject(updated);

        if (updated.model3DUrl) {
          setActiveStep(2);
          setLoading(false);
          setSuccess('¡Tu modelo 3D ya está listo!');
          addNotification(
            `Tu modelo 3D de "${updated.name}" está listo`,
            'success'
          );
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
          addNotification(
            `La generación de "${updated.name}" falló`,
            'error'
          );
        }
      } catch (err) {
        consecutiveFailures++;
        console.error(
          `Error consultando el estado del proyecto (intento ${consecutiveFailures}/${MAX_FAILURES})`,
          err
        );

        if (consecutiveFailures >= MAX_FAILURES) {
          clearInterval(interval);
          setLoading(false);
          setError(
            'Perdimos la conexión con el servidor. Verifica que esté disponible y vuelve a intentarlo. Tu proyecto no se perdió.'
          );
        }
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
    setCancelled3D(false);
    setParams({});
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
      const rejected = await projectService.rejectProject(project.id);

      // No pedimos otra imagen: pasamos al formulario de refinamiento con
      // parámetros (misma imagen, más detalle) según la categoría.
      setProject(rejected); // status REJECTED_2D
      setParams({});
      setActiveStep(1);
      setSuccess(
        'Cuéntanos más detalles y ajusta los parámetros para mejorar el diseño.'
      );
    } catch (err: any) {
      setError(
        getFriendlyError(err, 'No pudimos descartar el diseño. Inténtalo de nuevo.')
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGENERAR 2D (tras rechazo, con descripción + parámetros)
  // =========================
  const handleRegenerate2D = async () => {
    if (!project || !project.category) return;

    const fields = CATEGORY_PARAM_FIELDS[project.category];

    // Construimos el objeto de parámetros solo con los campos diligenciados.
    const parameters: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = (params[field.key] || '').trim();
      if (!raw) continue;
      if (field.type === 'int') parameters[field.key] = parseInt(raw, 10);
      else if (field.type === 'number') parameters[field.key] = parseFloat(raw);
      else if (field.type === 'list')
        parameters[field.key] = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      else parameters[field.key] = raw;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updated = await projectService.regenerate2D(
        project.id,
        description,
        parameters as ProjectParametersInput
      );

      setProject(updated); // WAITING_2D_APPROVAL con el nuevo render
      setActiveStep(1);
      setSuccess('¡Generamos un nuevo diseño con tus indicaciones! Revísalo.');
    } catch (err: any) {
      setError(
        getFriendlyError(err, 'No pudimos regenerar el diseño. Inténtalo de nuevo.')
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
    setCancelled3D(false);
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

  // =========================
  // DETENER GENERACIÓN 3D
  // =========================
  const handleCancel3D = async () => {
    if (!project) return;

    setError('');
    try {
      const updated = await projectService.cancel3D(project.id);

      // Vuelve a WAITING_FINAL_APPROVAL → el polling se detiene solo.
      setProject(updated);
      setLoading(false);
      setCancelled3D(true);
      setSuccess('Generación detenida. Puedes reanudarla cuando quieras.');
    } catch (err: any) {
      setError(
        getFriendlyError(err, 'No pudimos detener la generación. Inténtalo de nuevo.')
      );
    }
  };

  const selectedCategory =
    categories.find((c) => c.value === category) ?? null;

  // Parámetros usados (para mostrarlos junto a la imagen regenerada).
  const usedParamRows = project
    ? buildUsedParamRows(project.category, project.parameters)
    : [];

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
      <Container maxWidth={activeStep === 2 ? 'lg' : 'md'} sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
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
          {/* STEP 1 - REGENERANDO CON PARÁMETROS */}
          {/* ========================= */}
          {activeStep === 1 &&
            project &&
            project.status === 'GENERATING_2D_WITH_PARAMS' && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{ mb: 4, color: 'primary.main' }}
                />
                <Typography variant="h6" color="primary">
                  Generando tu nuevo diseño 2D...
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Puedes cambiar de ventana; el proceso continúa y se
                  mostrará aquí al terminar.
                </Typography>
              </Box>
            )}

          {/* ========================= */}
          {/* STEP 1 - REFINAR (diseño rechazado: más parámetros) */}
          {/* ========================= */}
          {activeStep === 1 &&
            project &&
            project.status === 'REJECTED_2D' && (
              <Box>
                <Typography
                  variant="h5"
                  align="center"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Mejoremos tu diseño
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 4 }}
                >
                  Danos más detalle y ajusta los parámetros. La nueva propuesta
                  se generará sobre tu imagen original (no necesitas subirla
                  otra vez).
                </Typography>

                {/* DOS COLUMNAS: formulario (izq) + última imagen generada (der) */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    alignItems: 'flex-start',
                    mb: 4,
                  }}
                >
                  {/* IZQUIERDA: parámetros */}
                  <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Describe con más detalle lo que quieres"
                      placeholder="Ej: igual pero con más ventanas y fachada en piedra clara."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      slotProps={{
                        htmlInput: { maxLength: 300 },
                        formHelperText: { sx: { textAlign: 'right', mr: 0 } },
                      }}
                      helperText={`${description.length}/300`}
                      sx={{ mb: 3 }}
                      disabled={loading}
                    />

                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      Parámetros del diseño
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      {(project.category
                        ? CATEGORY_PARAM_FIELDS[project.category]
                        : []
                      ).map((field) => (
                        <TextField
                          key={field.key}
                          fullWidth
                          label={`${field.label}${field.required ? ' *' : ''}`}
                          placeholder={field.placeholder}
                          type={
                            field.type === 'number' || field.type === 'int'
                              ? 'number'
                              : 'text'
                          }
                          value={params[field.key] || ''}
                          onChange={(e) =>
                            setParams((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          disabled={loading}
                          error={
                            !!field.required &&
                            !(params[field.key] || '').trim()
                          }
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* DERECHA: última imagen generada por la IA */}
                  <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      Diseño actual
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(44, 74, 109, 0.15)',
                        border: '1px solid rgba(107, 155, 209, 0.2)',
                        bgcolor: '#F8F9FA',
                      }}
                    >
                      {project.image2DUrl ? (
                        <CardMedia
                          component="img"
                          image={project.image2DUrl}
                          alt="Último diseño generado"
                          sx={{ width: '100%', maxHeight: 460, objectFit: 'contain' }}
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
                  </Box>
                </Box>

                {/* BOTONES CENTRADOS */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={resetFlow}
                    disabled={loading}
                    sx={{ px: 4, py: 1.5, borderRadius: 12 }}
                  >
                    Empezar de nuevo
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleRegenerate2D}
                    disabled={
                      loading ||
                      (project.category
                        ? CATEGORY_PARAM_FIELDS[project.category]
                        : []
                      )
                        .filter((f) => f.required)
                        .some((f) => !(params[f.key] || '').trim())
                    }
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={26} color="inherit" />
                    ) : (
                      'Generar nuevo diseño'
                    )}
                  </Button>
                </Box>
              </Box>
            )}

          {/* ========================= */}
          {/* STEP 1 - REVISAR (esperando aprobación) */}
          {/* ========================= */}
          {activeStep === 1 &&
            project &&
            project.status !== 'REJECTED_2D' &&
            project.status !== 'GENERATING_2D_WITH_PARAMS' && (
            <Box sx={{ py: 2 }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Revisa el concepto generado por la IA 2D
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                {project.parameters
                  ? 'Generamos una nueva propuesta con los parámetros que indicaste.'
                  : 'Nuestra IA ha interpretado tu imagen y generado esta propuesta.'}
              </Typography>

              {project.parameters ? (
                /* PARÁMETROS A LA IZQUIERDA + IMAGEN A LA DERECHA */
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    alignItems: 'flex-start',
                    mb: 4,
                  }}
                >
                  <Box sx={{ flex: { md: '0 0 280px' }, width: '100%' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      Parámetros usados
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      {usedParamRows.length > 0 ? (
                        usedParamRows.map((row) => (
                          <Box
                            key={row.label}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 2,
                              p: 1.25,
                              borderRadius: 2,
                              bgcolor: 'rgba(107, 155, 209, 0.08)',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600 }}
                            >
                              {row.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, textAlign: 'right' }}
                            >
                              {row.value}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin parámetros adicionales.
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      width: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(44, 74, 109, 0.15)',
                      border: '1px solid rgba(107, 155, 209, 0.2)',
                      bgcolor: '#F8F9FA',
                    }}
                  >
                    {project.image2DUrl ? (
                      <CardMedia
                        component="img"
                        image={project.image2DUrl}
                        alt="Render 2D"
                        sx={{ width: '100%', maxHeight: 460, objectFit: 'contain' }}
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
                </Box>
              ) : (
                /* IMAGEN CENTRADA (render inicial) */
                <Box
                  sx={{
                    maxWidth: 600,
                    mx: 'auto',
                    mb: 4,
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(44, 74, 109, 0.15)',
                    border: '1px solid rgba(107, 155, 209, 0.2)',
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
              )}

              {/* BOTONES CENTRADOS */}
              <Box
                sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}
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
                    '&:hover': { borderWidth: 2 },
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
                    <CircularProgress size={26} color="inherit" />
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
          {/* STEP 2 - AÚN SIN MODELO (generar / procesando) */}
          {activeStep === 2 && project && !project.model3DUrl && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Diseño aprobado. ¡Listo para la magia en 3D!
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
              >
                Nuestra segunda IA tomará el concepto 2D y construirá un
                modelo 3D detallado.
              </Typography>

              {!loading && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGenerate3D}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{ px: 6, py: 2, fontSize: '1.2rem', borderRadius: 12 }}
                >
                  {cancelled3D
                    ? 'Reanudar generación'
                    : project.status === 'FAILED'
                    ? 'Volver a generar el modelo 3D'
                    : 'Iniciar Generación 3D'}
                </Button>
              )}

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress
                    size={80}
                    thickness={4}
                    sx={{ mb: 4, color: 'secondary.main' }}
                  />

                  <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                    Procesando modelo 3D...
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel3D}
                  >
                    Detener generación
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* STEP 2 - MODELO LISTO: texto arriba, visor centrado y grande, botones abajo */}
          {activeStep === 2 && project && project.model3DUrl && (
            <Box sx={{ py: 4 }}>
              {/* TEXTO ARRIBA (centrado) */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  ¡Tu modelo 3D está listo!
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, fontWeight: 400 }}
                >
                  Explóralo en 360°: arrástralo para rotarlo, usa el scroll
                  para acercarte y míralo desde cualquier ángulo.
                </Typography>

                <Alert
                  severity="success"
                  sx={{ borderRadius: 2, display: 'inline-flex' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Generación completada
                  </Typography>
                </Alert>
              </Box>

              {/* VISOR centrado y más grande */}
              <Box sx={{ width: '100%' }}>
                <ModelViewer
                  modelUrl={project.model3DUrl}
                  backgroundImageUrl={backgroundImageUrl}
                />
              </Box>

              {/* BOTONES abajo de todo */}
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
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
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}