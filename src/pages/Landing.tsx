import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    title: 'Generación IA Avanzada',
    description: 'Convierte tus fotos en modelos 3D precisos usando inteligencia artificial.',
    color: 'primary',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 40 }} />,
    title: 'Diseño Conceptual',
    description: 'Visualiza tus ideas arquitectónicas antes de construir con renders 2D/3D.',
    color: 'secondary',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Procesamiento Rápido',
    description: 'Genera modelos 3D en minutos.',
    color: 'primary',
  },
];

const capabilities = [
  'Generación de renders 2D desde fotografías',
  'Conversión automática a modelos 3D',
  'Descarga en formatos estándar (GLB)',
  'Regeneración y ajuste de diseños',
  'Historial de diseños',
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 30%, rgba(107, 155, 209, 0.6) 0%, transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(158, 141, 173, 0.55) 0%, transparent 45%),
            radial-gradient(circle at 10% 80%, rgba(168, 216, 234, 0.4) 0%, transparent 40%),
            linear-gradient(135deg, #F8F9FA 0%, #E8D1E0 50%, #A8D8EA 100%)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '200% 200%, 200% 200%, 200% 200%, 100% 100%',
          animation: 'vivoBgMove 6s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ py: 6, display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
            {/* Left side - Content */}
            <Box sx={{ flex: 1, animation: 'fadeIn 0.8s ease-out' }}>
              <Box sx={{ mb: 4 }}>
                <Chip
                  label="Visualiza antes de construir!"
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: 'auto',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 3,
                  }}
                />
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 900,
                  letterSpacing: '-1.5px',
                  background: 'linear-gradient(135deg, #2C4A6D 0%, #6B9BD1 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  lineHeight: 1.1,
                }}
              >
                Arq-3✿
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.3rem', md: '1.8rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                  lineHeight: 1.3,
                }}
              >
                Transforma tus ideas en modelos 3D profesionales con IA
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Crea renders arquitectónicos impresionantes desde simples fotografías. Nuestra IA convierte conceptos en visualizaciones 3D profesionales en minutos.
              </Typography>

              {/* CTA Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.8,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(107, 155, 209, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(107, 155, 209, 0.4)',
                    },
                  }}
                >
                  Comenzar
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.8,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Ya tengo cuenta
                </Button>
              </Stack>

              {/* Trust indicators */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6B9BD1, #9E8DAD)',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Proyectos ilimitados
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #A8D8EA, #E8D1E0)',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Renderizado 360°
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right side - Visual */}
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                height: { xs: '300px', md: '500px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Floating card 1 */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '280px',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(107, 155, 209, 0.8) 0%, rgba(168, 216, 234, 0.6) 100%)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 24px 48px rgba(44, 74, 109, 0.2)',
                  top: '10%',
                  left: '5%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 5s ease-in-out infinite reverse',
                  p: 3,
                }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700 }}>IA Avanzada</Typography>
                </Box>
              </Box>

              {/* Floating card 2 */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '280px',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(158, 141, 173, 0.8) 0%, rgba(232, 209, 224, 0.6) 100%)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 24px 48px rgba(158, 141, 173, 0.2)',
                  bottom: '10%',
                  right: '5%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 5s ease-in-out infinite',
                  p: 3,
                }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <VisibilityIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700 }}>Visualización Pro</Typography>
                </Box>
              </Box>

              {/* Center card */}
              <Paper
                elevation={12}
                sx={{
                  position: 'absolute',
                  width: '320px',
                  height: '240px',
                  background: 'linear-gradient(135deg, rgba(248, 237, 248, 0.95) 70%, rgba(248,249,250,0.9) 30%)',
                  borderRadius: 3,
                  border: '1px solid rgba(107, 155, 209, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  zIndex: 10,
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    fontSize: '4rem',
                    mb: 2,
                  }}
                >
                  
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    background: 'linear-gradient(135deg, #2C4A6D 0%, #9E8DAD 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Modelos 3D
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En minutos
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.8rem' },
                fontWeight: 900,
                letterSpacing: '-0.5px',
                mb: 2,
                color: 'primary.dark',
              }}
            >
              ¿Qué puedes hacer?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Arq-AI 3D te permite crear, visualizar y compartir tus proyectos arquitectónicos con facilidad.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {features.map((feature, idx) => (
              <Card
                key={idx}
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(248,249,250,0.8) 0%, rgba(255,255,255,0.8) 100%)',
                  border: `1px solid rgba(107, 155, 209, 0.1)`,
                  transition: 'all 0.3s ease',
                  animation: `fadeIn 0.6s ease-out ${idx * 0.1}s backwards`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(44, 74, 109, 0.12)',
                    border: `1px solid rgba(107, 155, 209, 0.2)`,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      mb: 2,
                      color: feature.color === 'primary' ? 'primary.main' : 'secondary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      background:
                        feature.color === 'primary'
                          ? 'rgba(107, 155, 209, 0.1)'
                          : 'rgba(158, 141, 173, 0.1)',
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Capabilities Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, rgba(107, 155, 209, 0.05) 0%, rgba(158, 141, 173, 0.05) 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
            {/* CAMINITO DIAGONAL CON PASOS */}
            <Box
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(107, 155, 209, 0.08) 0%, rgba(168, 216, 234, 0.08) 100%)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                border: '2px solid rgba(107, 155, 209, 0.15)',
                minHeight: '280px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* CONTENEDOR DE PASOS EN HORIZONTAL */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  width: '100%',
                  gap: 2,
                  px: 2,
                }}
              >
                {/* PASO 1 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    animation: 'fadeIn 0.8s ease-out 0.2s backwards',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6B9BD1 0%, #A8D8EA 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '2rem',
                      boxShadow: '0 10px 30px rgba(107, 155, 209, 0.3)',
                      border: '3px solid white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    1
                  </Box>
                  <Box sx={{ textAlign: 'center', maxWidth: '110px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.4, color: 'primary.dark' }}>
                      Selecciona
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, fontSize: '0.8rem' }}>
                      Sube tu foto
                    </Typography>
                  </Box>
                </Box>

                {/* FLECHA O SEPARADOR */}
                <Box
                  sx={{
                    fontSize: '1.5rem',
                    color: 'rgba(107, 155, 209, 0.3)',
                    animation: 'fadeIn 0.8s ease-out 0.4s backwards',
                  }}
                >
                  →
                </Box>

                {/* PASO 2 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    animation: 'fadeIn 0.8s ease-out 0.6s backwards',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9E8DAD 0%, #E8D1E0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '2rem',
                      boxShadow: '0 10px 30px rgba(158, 141, 173, 0.3)',
                      border: '3px solid white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    2
                  </Box>
                  <Box sx={{ textAlign: 'center', maxWidth: '110px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.4, color: 'primary.dark' }}>
                      Revisa
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, fontSize: '0.8rem' }}>
                      Render 2D
                    </Typography>
                  </Box>
                </Box>

                {/* FLECHA O SEPARADOR */}
                <Box
                  sx={{
                    fontSize: '1.5rem',
                    color: 'rgba(158, 141, 173, 0.3)',
                    animation: 'fadeIn 0.8s ease-out 0.8s backwards',
                  }}
                >
                  →
                </Box>

                {/* PASO 3 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    animation: 'fadeIn 0.8s ease-out 1s backwards',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2C4A6D 0%, #6B9BD1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '2rem',
                      boxShadow: '0 10px 30px rgba(44, 74, 109, 0.3)',
                      border: '3px solid white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    3
                  </Box>
                  <Box sx={{ textAlign: 'center', maxWidth: '110px' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.4, color: 'primary.dark' }}>
                      Descarga
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, fontSize: '0.8rem' }}>
                      Modelo 3D
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  mb: 4,
                  color: 'primary.dark',
                }}
              >
                Capacidades Principales
              </Typography>

              <Stack spacing={2}>
                {capabilities.map((capability, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      gap: 3,
                      alignItems: 'flex-start',
                      animation: `fadeIn 0.6s ease-out ${idx * 0.1}s backwards`,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 24,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6B9BD1, #9E8DAD)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        mt: 0.5,
                      }}
                    >
                      ✿
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'text.primary',
                        }}
                      >
                        {capability}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `
            linear-gradient(135deg, rgba(107, 155, 209, 0.1) 0%, rgba(158, 141, 173, 0.1) 100%),
            linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)
          `,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 900,
              letterSpacing: '-0.5px',
              mb: 3,
              color: 'primary.dark',
            }}
          >
            Comienza hoy mismo
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'text.secondary',
              mb: 6,
              fontWeight: 400,
            }}
          >
            Únete y transforma tus proyectos.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 1.8,
                px: 6,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(107, 155, 209, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(107, 155, 209, 0.4)',
                },
              }}
            >
              Registrarse Gratis
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 1.8,
                px: 6,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                borderWidth: 2,
              }}
            >
              Iniciar Sesión
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
