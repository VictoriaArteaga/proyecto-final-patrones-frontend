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
  TextField,
  InputAdornment,
  Collapse,
  Divider,
} from '@mui/material';
import {
  AddBox as AddBoxIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  FilterAltOff as FilterAltOffIcon,
} from '@mui/icons-material';

import { projectService } from '../services/project.service';
import { getFriendlyError } from '../utils/errorMessages';
import {
  getCategoryMeta,
  getStatusMeta,
  CATEGORY_META,
} from '../utils/projectMeta';
import { ACTIVE_PROJECT_KEY } from '../utils/storageKeys';
import { DoublyLinkedList } from '../utils/DoublyLinkedList';
import type { ProjectResponseDTO, DesignCategory } from '../types/project.types';

export default function Dashboard() {
  const navigate = useNavigate();

  // Los proyectos se guardan en una lista doblemente enlazada (estructura propia).
  const [projectList, setProjectList] = useState<
    DoublyLinkedList<ProjectResponseDTO>
  >(() => new DoublyLinkedList());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Proyecto pendiente de confirmar borrado.
  const [toDelete, setToDelete] = useState<ProjectResponseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ===== FILTROS =====
  const [searchText, setSearchText] = useState('');
  // Set: estados/tipos seleccionados (toggle y pertenencia en O(1)).
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set()
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<DesignCategory>>(
    new Set()
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await projectService.getProjects();
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

  const openProject = (project: ProjectResponseDTO) => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    navigate('/new-project');
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);
    try {
      await projectService.deleteProject(toDelete.id);

      setProjectList((prev) => {
        const next = prev.clone();
        next.remove((p) => p.id === toDelete.id);
        return next;
      });

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

  // Alterna un valor dentro de un Set (devuelve uno nuevo para React).
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  };
  const toggleType = (type: DesignCategory) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchText('');
    setSelectedStatuses(new Set());
    setSelectedTypes(new Set());
    setDateFrom('');
    setDateTo('');
  };

  // Todos los proyectos (para conteo total y estados disponibles).
  const allProjects = projectList.toArray();

  // Estados realmente presentes (Set evita duplicados) → chips relevantes.
  const availableStatuses = Array.from(
    new Set(allProjects.map((p) => p.status))
  );

  // Predicado que combina las tres capas de filtrado.
  const matchesFilters = (p: ProjectResponseDTO): boolean => {
    const q = searchText.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;

    if (selectedStatuses.size > 0 && !selectedStatuses.has(p.status))
      return false;

    if (
      selectedTypes.size > 0 &&
      (!p.category || !selectedTypes.has(p.category))
    )
      return false;

    if (dateFrom && new Date(p.createdAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.createdAt) > end) return false;
    }
    return true;
  };

  // Filtramos recorriendo la lista doble y pasamos a arreglo para renderizar.
  const filtered = projectList.filter(matchesFilters).toArray();

  // Map: filtros activos (dimensión → etiqueta + cómo quitarlo).
  const activeFilters = new Map<
    string,
    { label: string; onRemove: () => void }
  >();
  if (searchText.trim())
    activeFilters.set('search', {
      label: `Nombre: "${searchText.trim()}"`,
      onRemove: () => setSearchText(''),
    });
  selectedStatuses.forEach((s) =>
    activeFilters.set(`status:${s}`, {
      label: getStatusMeta(s).label,
      onRemove: () =>
        setSelectedStatuses((prev) => {
          const n = new Set(prev);
          n.delete(s);
          return n;
        }),
    })
  );
  selectedTypes.forEach((t) =>
    activeFilters.set(`type:${t}`, {
      label: getCategoryMeta(t).label,
      onRemove: () =>
        setSelectedTypes((prev) => {
          const n = new Set(prev);
          n.delete(t);
          return n;
        }),
    })
  );
  if (dateFrom)
    activeFilters.set('from', {
      label: `Desde ${dateFrom}`,
      onRemove: () => setDateFrom(''),
    });
  if (dateTo)
    activeFilters.set('to', {
      label: `Hasta ${dateTo}`,
      onRemove: () => setDateTo(''),
    });

  const activeFilterEntries = Array.from(activeFilters.entries());
  const hasActiveFilters = activeFilterEntries.length > 0;

  const categoryEntries = Object.keys(CATEGORY_META) as DesignCategory[];

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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 2 }}>
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

        {/* VACÍO (sin proyectos en absoluto) */}
        {!loading && !error && allProjects.length === 0 && (
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

        {/* PANEL DE FILTROS + GRID */}
        {!loading && !error && allProjects.length > 0 && (
          <>
            {/* ===== PANEL DE FILTROS ===== */}
            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              {/* Capa 1: búsqueda instantánea */}
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre de proyecto..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />

              {/* Capa 2: chips de estado */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableStatuses.map((status) => {
                  const meta = getStatusMeta(status);
                  const selected = selectedStatuses.has(status);
                  return (
                    <Chip
                      key={status}
                      label={meta.label}
                      variant="outlined"
                      onClick={() => toggleStatus(status)}
                      icon={
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: meta.color,
                            ml: 1,
                          }}
                        />
                      }
                      sx={{
                        fontWeight: 600,
                        borderColor: selected
                          ? meta.color
                          : 'rgba(107, 155, 209, 0.4)',
                        bgcolor: selected ? `${meta.color}22` : 'transparent',
                        color: selected ? meta.color : 'text.primary',
                        '&:hover': { bgcolor: `${meta.color}1A` },
                      }}
                    />
                  );
                })}
              </Box>

              {/* Toggle: filtros avanzados */}
              <Button
                size="small"
                startIcon={<TuneIcon />}
                endIcon={
                  advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setAdvancedOpen((v) => !v)}
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                Filtros avanzados
              </Button>

              {/* Capa 3: filtros avanzados (colapsables) */}
              <Collapse in={advancedOpen}>
                <Box sx={{ pt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary' }}
                  >
                    Tipo de proyecto
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 2 }}
                  >
                    {categoryEntries.map((type) => {
                      const meta = CATEGORY_META[type];
                      const selected = selectedTypes.has(type);
                      const Icon = meta.icon;
                      return (
                        <Chip
                          key={type}
                          label={meta.label}
                          variant="outlined"
                          onClick={() => toggleType(type)}
                          icon={
                            <Icon
                              sx={{ fontSize: 16, color: `${meta.color} !important` }}
                            />
                          }
                          sx={{
                            fontWeight: 600,
                            borderColor: selected
                              ? meta.color
                              : 'rgba(107, 155, 209, 0.4)',
                            bgcolor: selected ? `${meta.color}22` : 'transparent',
                            color: selected ? meta.color : 'text.primary',
                            '&:hover': { bgcolor: `${meta.color}1A` },
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary' }}
                  >
                    Rango de fechas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                    <TextField
                      type="date"
                      size="small"
                      label="Desde"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      label="Hasta"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Box>
                </Box>
              </Collapse>

              {/* Barra de filtros activos */}
              {hasActiveFilters && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
                    >
                      Filtros activos:
                    </Typography>

                    {activeFilterEntries.map(([key, f]) => (
                      <Chip
                        key={key}
                        label={f.label}
                        size="small"
                        onDelete={f.onRemove}
                        deleteIcon={<CloseIcon />}
                        sx={{
                          bgcolor: 'rgba(107, 155, 209, 0.12)',
                          fontWeight: 600,
                        }}
                      />
                    ))}

                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<FilterAltOffIcon />}
                      onClick={clearAllFilters}
                      sx={{ ml: 'auto' }}
                    >
                      Limpiar todo
                    </Button>
                  </Box>
                </>
              )}
            </Card>

            {/* Conteo de resultados */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {filtered.length}{' '}
              {filtered.length === 1 ? 'proyecto' : 'proyectos'}
              {hasActiveFilters ? ' (filtrados)' : ''}
            </Typography>

            {/* SIN RESULTADOS PARA LOS FILTROS */}
            {filtered.length === 0 ? (
              <Card
                sx={{
                  textAlign: 'center',
                  py: 6,
                  px: 3,
                  border: '2px dashed rgba(107, 155, 209, 0.3)',
                  boxShadow: 'none',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No hay proyectos que coincidan
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Prueba ajustando o quitando algunos filtros.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FilterAltOffIcon />}
                  onClick={clearAllFilters}
                >
                  Limpiar filtros
                </Button>
              </Card>
            ) : (
              /* GRID DE PROYECTOS */
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
                {filtered.map((project) => {
                  const cat = getCategoryMeta(project.category);
                  const statusMeta = getStatusMeta(project.status);
                  const CatIcon = cat.icon;
                  const imageUrl =
                    project.image2DUrl || project.imageOriginalUrl;

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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sin imagen aún
                              </Typography>
                            </Box>
                          )}

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
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
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
          </>
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
            color="secondary"
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
