import { useState } from 'react';
import { 
  Box, Container, Typography, Tabs, Tab, Card, 
  Grid, Paper, Chip
} from '@mui/material';
import {
  ViewList as ArrayIcon,
  LinearScale as LinkedListIcon,
  Layers as StackIcon,
  SyncAlt as QueueIcon,
  AccountTree as TreeIcon,
  Hub as GraphIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VisualArray = () => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 4, justifyContent: 'center' }}>
    {[5, 12, 7, 23, 8].map((val, idx) => (
      <Box key={idx} sx={{ 
        textAlign: 'center',
        opacity: 0,
        animation: 'fadeIn 0.6s ease-out forwards',
        animationDelay: `${idx * 0.15}s`
      }}>
        <Paper elevation={4} sx={{ 
          width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', 
          bgcolor: 'primary.dark', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: 2,
          transition: 'all 0.3s',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'primary.main', color: '#000' }
        }}>
          {val}
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          índice {idx}
        </Typography>
      </Box>
    ))}
  </Box>
);

const VisualStack = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: 1, my: 4, alignItems: 'center' }}>
    {['Elemento 1', 'Elemento 2', 'Elemento 3 (Cima)'].map((val, idx) => (
      <Paper key={idx} elevation={4} sx={{ 
        width: 150, p: 2, textAlign: 'center', 
        bgcolor: idx === 2 ? 'secondary.main' : 'primary.dark', 
        color: 'white', fontWeight: 'bold', borderRadius: 2,
        animation: idx === 2 ? 'float 2s ease-in-out infinite' : 'none',
        transition: 'all 0.3s'
      }}>
        {val}
      </Paper>
    ))}
    <Typography variant="caption" color="secondary.main" sx={{ mb: 1 }}>↑ Push / Pop ↑</Typography>
  </Box>
);

const VisualQueue = () => (
  <Box sx={{ display: 'flex', gap: 1, my: 4, alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
    <Typography variant="caption" color="primary.main">Encolar →</Typography>
    {['Nuevo', 'Medio', 'Primero'].map((val, idx) => (
      <Paper key={idx} elevation={4} sx={{ 
        width: 100, p: 2, textAlign: 'center', 
        bgcolor: idx === 0 ? 'secondary.main' : 'primary.dark', 
        color: 'white', fontWeight: 'bold', borderRadius: 2,
        animation: idx === 0 ? 'fadeIn 1s ease-out infinite alternate' : 'none'
      }}>
        {val}
      </Paper>
    ))}
    <Typography variant="caption" color="secondary.main">→ Desencolar</Typography>
  </Box>
);

export default function DataStructures() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const structures = [
    { label: 'Arrays', icon: <ArrayIcon />, color: 'primary' },
    { label: 'Pilas (Stacks)', icon: <StackIcon />, color: 'secondary' },
    { label: 'Colas (Queues)', icon: <QueueIcon />, color: 'success' },
    { label: 'Listas Enlazadas', icon: <LinkedListIcon />, color: 'warning' },
    { label: 'Árboles (Trees)', icon: <TreeIcon />, color: 'info' },
    { label: 'Grafos (Graphs)', icon: <GraphIcon />, color: 'error' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }} color="primary.main">
          Estructuras de Datos
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Comprender cómo se organizan los datos es fundamental para el diseño de software eficiente.
        </Typography>
      </Box>

      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 600, overflow: 'hidden' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{ 
            borderRight: 1, 
            borderColor: 'divider', 
            minWidth: { xs: '100%', md: 250 },
            bgcolor: 'rgba(0,0,0,0.2)'
          }}
        >
          {structures.map((s, idx) => (
            <Tab 
              key={idx} 
              icon={s.icon} 
              iconPosition="start" 
              label={s.label} 
              sx={{ 
                justifyContent: 'flex-start', 
                textAlign: 'left', 
                py: 3,
                fontWeight: value === idx ? 700 : 500,
                fontSize: '1rem'
              }} 
            />
          ))}
        </Tabs>

        {/* CONTENIDO ARRAY */}
        <TabPanel value={value} index={0}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrayIcon fontSize="large" color="primary" /> Arrays (Arreglos)
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2, color: 'text.secondary' }}>
            Un array es una estructura de datos lineal que almacena elementos del mismo tipo en ubicaciones de memoria contiguas. 
            El tamaño del array se define en su creación (en lenguajes estáticos).
          </Typography>
          
          <VisualArray />

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%', borderLeft: '4px solid #69F0AE' }}>
                <Typography variant="h6" gutterBottom color="success.main">Ventajas</Typography>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Acceso aleatorio rápido (O(1)) usando el índice.</li>
                  <li>Uso eficiente de memoria al no requerir punteros extra.</li>
                </ul>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%', borderLeft: '4px solid #FF5252' }}>
                <Typography variant="h6" gutterBottom color="error.main">Desventajas</Typography>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Tamaño fijo (en muchos lenguajes).</li>
                  <li>Inserción y eliminación lentas (O(n)) ya que requiere desplazar elementos.</li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* CONTENIDO PILA */}
        <TabPanel value={value} index={1}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <StackIcon fontSize="large" color="secondary" /> Pilas (Stacks)
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2, color: 'text.secondary' }}>
            Una pila es una estructura de datos lineal que sigue el principio LIFO (Last In, First Out). 
            El último elemento agregado es el primero en ser retirado. Imagina una pila de platos.
          </Typography>

          <VisualStack />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Operaciones Principales:</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="Push: Añadir a la cima (O(1))" color="primary" />
              <Chip label="Pop: Retirar de la cima (O(1))" color="secondary" />
              <Chip label="Peek: Ver cima sin retirar" variant="outlined" />
            </Box>
          </Box>
        </TabPanel>

        {/* CONTENIDO COLA */}
        <TabPanel value={value} index={2}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <QueueIcon fontSize="large" color="success" /> Colas (Queues)
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2, color: 'text.secondary' }}>
            Una cola es una estructura de datos lineal que sigue el principio FIFO (First In, First Out). 
            El primer elemento agregado es el primero en ser retirado. Como una fila en el supermercado.
          </Typography>

          <VisualQueue />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Casos de Uso Comunes:</Typography>
            <ul style={{ color: '#B2BAC2', paddingLeft: 20 }}>
              <li>Sistemas de impresión (cola de impresión).</li>
              <li>Procesamiento asíncrono (RabbitMQ, SQS).</li>
              <li>Manejo de peticiones en servidores web.</li>
            </ul>
          </Box>
        </TabPanel>

        {/* Otros TabPanels simplificados para el ejemplo */}
        <TabPanel value={value} index={3}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}><LinkedListIcon /> Listas Enlazadas</Typography>
          <Typography color="text.secondary">Una secuencia de nodos donde cada nodo contiene datos y una referencia (puntero) al siguiente nodo en la secuencia. Permite inserción/eliminación eficiente O(1) si se conoce el nodo, pero el acceso aleatorio es lento O(n).</Typography>
        </TabPanel>

        <TabPanel value={value} index={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}><TreeIcon /> Árboles</Typography>
          <Typography color="text.secondary">Una estructura jerárquica con un nodo raíz y subnodos (hijos). Muy útiles para representar jerarquías, como sistemas de archivos, o para búsquedas rápidas (Árboles Binarios de Búsqueda).</Typography>
        </TabPanel>

        <TabPanel value={value} index={5}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}><GraphIcon /> Grafos</Typography>
          <Typography color="text.secondary">Un conjunto de nodos (vértices) conectados por bordes (aristas). Ideales para modelar redes, como redes sociales, mapas de navegación (GPS), o topologías de red.</Typography>
        </TabPanel>

      </Card>
    </Container>
  );
}
