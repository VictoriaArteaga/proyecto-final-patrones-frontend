import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
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
} from '@mui/icons-material';

interface ModelViewerProps {
  modelUrl: string;
  backgroundImageUrl: string;
}

function BackgroundSphere({ imageUrl }: { imageUrl: string }) {
  const { scene } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      scene.background = texture;

      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
      }
    });

    return () => {
      scene.background = null;
    };
  }, [imageUrl, scene]);

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
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
      position={[0, -0.01, 0]}
    />
  );
}

function CameraController({ resetTrigger }: { resetTrigger: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(3, 2, 5);
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

export default function ModelViewer({
  modelUrl,
  backgroundImageUrl,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
        height: isFullscreen ? '100vh' : { xs: 400, sm: 500, md: 600 },
        borderRadius: isFullscreen ? 0 : 4,
        overflow: 'hidden',
        border: '1px solid rgba(107, 155, 209, 0.15)',
        background:
          'linear-gradient(135deg, #0a0a1a 0%, #111827 50%, #0c1929 100%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          border: '1px solid rgba(107, 155, 209, 0.3)',
          boxShadow: '0 12px 48px rgba(107, 155, 209, 0.15)',
        },
      }}
    >
      <Fade in={isLoading} timeout={400}>
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
        camera={{ position: [3, 2, 5], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4 * lightIntensity} />
        <directionalLight position={[5, 8, 5]} intensity={1.0 * lightIntensity} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 4, -5]} intensity={0.3 * lightIntensity} />
        <pointLight position={[0, 3, 0]} intensity={0.4 * lightIntensity} color="#A8D8EA" />
        <hemisphereLight args={['#A8D8EA', '#2C4A6D', 0.35 * lightIntensity]} />

        <CameraController resetTrigger={resetTrigger} />

        {backgroundImageUrl && <BackgroundSphere imageUrl={backgroundImageUrl} />}
        {showGrid && <FloorGrid />}

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={1}
          maxDistance={20}
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
