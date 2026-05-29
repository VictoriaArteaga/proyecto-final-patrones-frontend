import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Replay as ReplayIcon,
  Mouse as MouseIcon,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────
interface ModelViewerProps {
  modelUrl: string;
  backgroundImageUrl: string;
}

// ─── Background Sphere ──────────────────────────────────────
function BackgroundSphere({ imageUrl }: { imageUrl: string }) {
  const { scene } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      // Set as scene background
      scene.background = texture;

      // Also apply to the sphere for a wrapped-around feel
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

// ─── 3D Model ───────────────────────────────────────────────
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Gentle float animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
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

// ─── Camera Reset Helper ────────────────────────────────────
function CameraController({
  resetTrigger,
}: {
  resetTrigger: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(3, 2, 5);
      camera.lookAt(0, 0, 0);
    }
  }, [resetTrigger, camera]);

  return null;
}

// ─── Loading Fallback ───────────────────────────────────────
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#6B9BD1"
        wireframe
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function ModelViewer({
  modelUrl,
  backgroundImageUrl,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fullscreen toggle
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

  // Listen for fullscreen exit via Escape
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Simulate loading complete after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [modelUrl]);

  return (
    <Paper
      ref={containerRef}
      elevation={8}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : { xs: 350, sm: 450, md: 550 },
        borderRadius: isFullscreen ? 0 : 4,
        overflow: 'hidden',
        border: '1px solid rgba(107, 155, 209, 0.2)',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        transition: 'all 0.4s ease',
      }}
    >
      {/* ── Loading Overlay ── */}
      {isLoading && (
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
              'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(15,52,96,0.95))',
            gap: 2,
          }}
        >
          <CircularProgress
            size={56}
            thickness={4}
            sx={{
              color: '#6B9BD1',
              filter: 'drop-shadow(0 0 12px rgba(107, 155, 209, 0.5))',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: '#A8D8EA',
              fontWeight: 500,
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            Cargando modelo 3D...
          </Typography>
        </Box>
      )}

      {/* ── Toolbar ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 5,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title="Restablecer cámara" arrow>
          <IconButton
            onClick={() => setResetTrigger((n) => n + 1)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(107, 155, 209, 0.3)',
                transform: 'rotate(-180deg)',
              },
              transition: 'all 0.4s ease',
            }}
          >
            <ReplayIcon />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          arrow
        >
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(107, 155, 209, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Controls Hint ── */}
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
          bgcolor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          borderRadius: 6,
          px: 2,
          py: 0.8,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease 1s',
        }}
      >
        <MouseIcon sx={{ fontSize: 16, color: '#A8D8EA' }} />
        <Typography
          variant="caption"
          sx={{ color: '#A8D8EA', fontWeight: 500, whiteSpace: 'nowrap' }}
        >
          Clic + arrastrar para rotar · Scroll para zoom
        </Typography>
      </Box>

      {/* ── Three.js Canvas ── */}
      <Canvas
        camera={{ position: [3, 2, 5], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 4, -5]} intensity={0.4} />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#A8D8EA" />
        <hemisphereLight
          args={['#A8D8EA', '#2C4A6D', 0.5]}
        />

        {/* Camera control */}
        <CameraController resetTrigger={resetTrigger} />

        {/* Background image sphere */}
        <BackgroundSphere imageUrl={backgroundImageUrl} />

        {/* 3D Model */}
        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
        </Suspense>

        {/* Orbit controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={1}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </Paper>
  );
}
