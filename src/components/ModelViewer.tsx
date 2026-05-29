import { Suspense, useRef, useState, useEffect, useCallback, useMemo, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  Button,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Replay as ReplayIcon,
  Mouse as MouseIcon,
  GridOn as GridOnIcon,
  GridOff as GridOffIcon,
  ThreeSixty as ThreeSixtyIcon,
  LightMode as LightModeIcon,
  Download as DownloadIcon,
  ErrorOutlined as ErrorOutlineIcon,
} from '@mui/icons-material';

interface ModelViewerProps {
  modelUrl: string;
  backgroundImageUrl: string;
}

// Fondo 360 que gira con la escena al orbitar, optimizado para verse nítido:
// anisotropía al máximo + material básico (sin tonemapping) = sin desenfoque.
function BackgroundSphere({ imageUrl }: { imageUrl: string }) {
  const { gl } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(imageUrl, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      // Clave contra el desenfoque en ángulos rasantes.
      tex.anisotropy = gl.capabilities.getMaxAnisotropy();
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      setTexture(tex);
    });
    return () => {
      disposed = true;
    };
  }, [imageUrl, gl]);

  if (!texture) return null;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[30, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Escala el modelo a un tamaño objetivo grande y consistente (sin importar
  // las dimensiones originales), y activa sombras en todas sus mallas.
  const scale = useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return 4.2 / maxDim;
  }, [scene]);

  // <Center>: centra el modelo en los tres ejes (queda en el centro de la vista,
  // flotando, ya no apoyado en el piso).
  return (
    <Center>
      <group scale={scale}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

function FloorGrid() {
  return (
    <Grid
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.6}
      cellColor="#6B9BD1"
      sectionSize={2}
      sectionThickness={1.2}
      sectionColor="#9E8DAD"
      fadeDistance={15}
      fadeStrength={1}
      followCamera={false}
      position={[0, -2.6, 0]}
    />
  );
}

function CameraController({ resetTrigger }: { resetTrigger: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(3, 2.2, 4.5);
      camera.lookAt(0, 0, 0);
    }
  }, [resetTrigger, camera]);

  return null;
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial
        color="#6B9BD1"
        wireframe
        transparent
        opacity={0.6}
        emissive="#6B9BD1"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function ToolbarButton({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title} arrow placement="left">
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          bgcolor: active
            ? 'rgba(107, 155, 209, 0.35)'
            : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          color: active ? '#A8D8EA' : '#fff',
          width: 40,
          height: 40,
          '&:hover': {
            bgcolor: 'rgba(107, 155, 209, 0.3)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

// Captura errores al cargar el .glb (URL inválida, 404, CORS, formato no soportado).
// Evita que un fallo de carga rompa toda la vista; avisa al padre vía onError.
class ModelErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('No se pudo cargar el modelo 3D:', error);
    this.props.onError();
  }

  render() {
    // Si falló, no renderizamos el modelo roto dentro del Canvas.
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function ModelViewer({
  modelUrl,
  backgroundImageUrl,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(1);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, [modelUrl]);

  const cycleLightIntensity = () => {
    setLightIntensity((prev) => {
      if (prev >= 1.8) return 0.4;
      return prev + 0.4;
    });
  };

  return (
    <Paper
      ref={containerRef}
      elevation={12}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : { xs: 460, sm: 620, md: 760 },
        borderRadius: isFullscreen ? 0 : 4,
        overflow: 'hidden',
        border: '1px solid rgba(107, 155, 209, 0.15)',
        background:
          'linear-gradient(135deg, #0a0a1a 0%, #111827 50%, #0c1929 100%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        // Cursor de "manito" para indicar que el modelo se puede arrastrar.
        '& canvas': { cursor: 'grab' },
        '& canvas:active': { cursor: 'grabbing' },
        '&:hover': {
          border: '1px solid rgba(107, 155, 209, 0.3)',
          boxShadow: '0 12px 48px rgba(107, 155, 209, 0.15)',
        },
      }}
    >
      <Fade in={isLoading && !loadError} timeout={400}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(ellipse at center, rgba(15,52,96,0.97) 0%, rgba(10,10,26,0.98) 100%)',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              size={72}
              thickness={3}
              sx={{
                color: '#6B9BD1',
                filter: 'drop-shadow(0 0 16px rgba(107, 155, 209, 0.4))',
              }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: '#A8D8EA',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          >
            Cargando modelo 3D...
          </Typography>
        </Box>
      </Fade>

      {/* OVERLAY DE ERROR: si el modelo no se pudo cargar */}
      {loadError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 2,
            px: 3,
            background:
              'radial-gradient(ellipse at center, rgba(15,52,96,0.97) 0%, rgba(10,10,26,0.98) 100%)',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 56, color: '#E8D1E0' }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            No se pudo cargar el modelo 3D
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(168, 216, 234, 0.8)', maxWidth: 380 }}
          >
            El archivo puede no estar disponible o el formato no es válido.
            Puedes intentar descargarlo directamente.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            href={modelUrl}
            target="_blank"
            sx={{
              mt: 1,
              color: '#A8D8EA',
              borderColor: 'rgba(168, 216, 234, 0.5)',
              '&:hover': { borderColor: '#A8D8EA' },
            }}
          >
            Descargar modelo (.glb)
          </Button>
        </Box>
      )}

      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.8,
          p: 0.6,
          borderRadius: 3,
          bgcolor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <ToolbarButton title="Restablecer cámara" onClick={() => setResetTrigger((n) => n + 1)}>
          <ReplayIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title={autoRotate ? 'Detener rotación' : 'Auto-rotar'} onClick={() => setAutoRotate((v) => !v)} active={autoRotate}>
          <ThreeSixtyIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title={showGrid ? 'Ocultar grilla' : 'Mostrar grilla'} onClick={() => setShowGrid((v) => !v)} active={showGrid}>
          {showGrid ? <GridOnIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
        </ToolbarButton>
        <ToolbarButton title={`Luz: ${Math.round(lightIntensity * 100)}%`} onClick={cycleLightIntensity}>
          <LightModeIcon fontSize="small" />
        </ToolbarButton>
        <Box sx={{ width: '100%', height: '1px', bgcolor: 'rgba(255,255,255,0.08)', my: 0.3 }} />
        <ToolbarButton title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} onClick={toggleFullscreen}>
          {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </ToolbarButton>
        <ToolbarButton
          title="Descargar modelo"
          onClick={() => {
            const a = document.createElement('a');
            a.href = modelUrl;
            a.download = 'model.glb';
            a.click();
          }}
        >
          <DownloadIcon fontSize="small" />
        </ToolbarButton>
      </Box>

      <Fade in={!isLoading} timeout={1200}>
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.06)',
            px: 2,
            py: 0.7,
          }}
        >
          <MouseIcon sx={{ fontSize: 14, color: '#A8D8EA', opacity: 0.7 }} />
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(168, 216, 234, 0.7)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              fontSize: '0.72rem',
            }}
          >
            Arrastrar para rotar · Scroll para zoom · Clic derecho para mover
          </Typography>
        </Box>
      </Fade>

      <Canvas
        camera={{ position: [3, 2.2, 4.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        shadows
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
        }}
      >
        {/* Iluminación más clara y realista */}
        <ambientLight intensity={0.7 * lightIntensity} />
        <directionalLight
          position={[5, 9, 5]}
          intensity={1.5 * lightIntensity}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 5, -5]} intensity={0.5 * lightIntensity} />
        <pointLight position={[0, 4, 0]} intensity={0.5 * lightIntensity} color="#FFFFFF" />
        <hemisphereLight args={['#FFFFFF', '#2C4A6D', 0.6 * lightIntensity]} />

        <CameraController resetTrigger={resetTrigger} />

        {backgroundImageUrl && <BackgroundSphere imageUrl={backgroundImageUrl} />}
        {showGrid && <FloorGrid />}

        <Suspense fallback={<LoadingFallback />}>
          <ModelErrorBoundary
            key={modelUrl}
            onError={() => {
              setLoadError(true);
              setIsLoading(false);
            }}
          >
            <Model url={modelUrl} />
          </ModelErrorBoundary>
        </Suspense>

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={18}
          autoRotate={autoRotate}
          autoRotateSpeed={0.4}
          dampingFactor={0.06}
          enableDamping
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>
    </Paper>
  );
}
