import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  AddBox as AddBoxIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { projectService } from '../services/project.service';
import { getFriendlyError } from '../utils/errorMessages';
import { getCategoryMeta, getStatusMeta } from '../utils/projectMeta';
import { ACTIVE_PROJECT_KEY } from '../utils/storageKeys';
import { DoublyLinkedList } from '../utils/DoublyLinkedList';
import type { ProjectResponseDTO } from '../types/project.types';

export default function Dashboard() {
  const navigate = useNavigate();

  // Los proyectos se guardan en una lista doblemente enlazada (estructura propia).
  const [projectList, setProjectList] = useState<
    DoublyLinkedList<ProjectResponseDTO>
  >(() => new DoublyLinkedList());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Para renderizar (React pinta arreglos) recorremos la lista a un arreglo.
  const projects = projectList.toArray();

  // Proyecto pendiente de confirmar borrado.
  const [toDelete, setToDelete] = useState<ProjectResponseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await projectService.getProjects();
        // Construimos la lista doblemente enlazada a partir de la respuesta.
        if (!cancelled) setProjectList(DoublyLinkedList.from(data));
      } catch (err) {
        if (!cancelled) {
          setError(
            getFriendlyError(
              err,
              'No pudimos cargar tus proyectos. Inténtalo de nuevo.'
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Abrir un proyecto: lo marcamos como activo y vamos al flujo de generación,
  // que lo reanuda desde el backend en el paso correcto.
  const openProject = (project: ProjectResponseDTO) => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    navigate('/new-project');
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);
    try {
      await projectService.deleteProject(toDelete.id);

      // Eliminamos el nodo de la lista (O(1) al desenlazar) y entregamos una
      // instancia nueva para que React vuelva a renderizar.
      setProjectList((prev) => {
        const next = prev.clone();
        next.remove((p) => p.id === toDelete.id);
        return next;
      });

      // Si el proyecto borrado era el "activo", limpiamos la referencia.
      if (localStorage.getItem(ACTIVE_PROJECT_KEY) === toDelete.id) {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }

      setToDelete(null);
    } catch (err) {
      setError(
        getFriendlyError(err, 'No pudimos eliminar el proyecto. Inténtalo de nuevo.')
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
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
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            mt: 2,
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}
              color="primary.main"
            >
              Mis proyectos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Aquí están todos los diseños que has generado.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddBoxIcon />}
            onClick={() => navigate('/new-project')}
            sx={{ py: 1.2, px: 3 }}
          >
            Nueva generación
          </Button>
        </Box>

        {/* CARGANDO */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress size={56} thickness={4} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              Cargando tus proyectos...
            </Typography>
          </Box>
        )}

        {/* ERROR */}
        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* VACÍO */}
        {!loading && !error && projects.length === 0 && (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              border: '2px dashed rgba(107, 155, 209, 0.3)',
              boxShadow: 'none',
            }}
          >
            <ImageNotSupportedIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Aún no tienes proyectos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comienza creando tu primer diseño con inteligencia artificial.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => navigate('/new-project')}
            >
              Crear mi primer proyecto
            </Button>
          </Card>
        )}

        {/* GRID DE PROYECTOS */}
        {!loading && !error && projects.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
              pb: 6,
            }}
          >
            {projects.map((project) => {
              const cat = getCategoryMeta(project.category);
              const statusMeta = getStatusMeta(project.status);
              const CatIcon = cat.icon;
              const imageUrl = project.image2DUrl || project.imageOriginalUrl;

              return (
                <Card
                  key={project.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* BOTÓN ELIMINAR (encima de todo) */}
                  <Tooltip title="Eliminar proyecto">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToDelete(project);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#E74C3C',
                        '&:hover': {
                          bgcolor: '#E74C3C',
                          color: '#FFFFFF',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <CardActionArea
                    onClick={() => openProject(project)}
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    {/* IMAGEN */}
                    <Box sx={{ position: 'relative' }}>
                      {imageUrl ? (
                        <CardMedia
                          component="img"
                          height="180"
                          image={imageUrl}
                          alt={project.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 180,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.color}0D 100%)`,
                            color: cat.color,
                          }}
                        >
                          <CatIcon sx={{ fontSize: 44, opacity: 0.7 }} />
                          <Typography variant="caption" color="text.secondary">
                            Sin imagen aún
                          </Typography>
                        </Box>
                      )}

                      {/* CHIP DE ESTADO */}
                      <Chip
                        label={statusMeta.label}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontWeight: 600,
                          color: '#FFFFFF',
                          bgcolor: statusMeta.color,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        }}
                      />
                    </Box>

                    {/* CONTENIDO */}
                    <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.3,
                          mb: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={project.name}
                      >
                        {project.name}
                      </Typography>

                      {/* CATEGORÍA */}
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: `${cat.color}1F`,
                          color: cat.color,
                        }}
                      >
                        <CatIcon sx={{ fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {cat.label}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>

      {/* DIÁLOGO DE CONFIRMACIÓN DE BORRADO */}
      <Dialog open={!!toDelete} onClose={() => !deleting && setToDelete(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar proyecto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar{' '}
            <strong>{toDelete?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setToDelete(null)}
            disabled={deleting}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
