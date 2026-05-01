<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, Link, 
  CircularProgress, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { authService } from '../services/auth.service';
import type { LoginRequestDTO } from '../types/auth.types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const credentials: LoginRequestDTO = { email, password };
      const response = await authService.login(credentials);
      
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
      
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciales incorrectas o el servidor no responde.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ padding: 4, width: '100%', borderRadius: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <LoginIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>

          {/* CORRECCIÓN: fontWeight movido adentro de sx */}
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenido
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder al sistema
          </Typography>
          
          {error && (
            <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal" required fullWidth id="email" label="Correo Electrónico"
              name="email" autoComplete="email" autoFocus disabled={loading}
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña"
              type={showPassword ? 'text' : 'password'} id="password"
              autoComplete="current-password" disabled={loading}
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              /* CORRECCIÓN: slotProps reemplaza a InputProps */
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', boxShadow: 3 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                {/* CORRECCIÓN: fontWeight movido adentro de sx */}
                <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 'bold' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
=======
import "../styles/login.css";
import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";

export default function Login() {
    const [toggle, setToggle] = useState<boolean>(false);

  // LOGIN
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

  // REGISTROO
    const [name, setName] = useState<string>("");
    const [regEmail, setRegEmail] = useState<string>("");
    const [regPassword, setRegPassword] = useState<string>("");

  // LOGIN
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const data = await loginUser({ email, password });
        console.log(data);
        alert("Login exitoso");
        } catch (error) {
        console.error(error);
        alert("Error en login");
        }
    };

// REGISTRO
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const data = await registerUser({
            name,
            email: regEmail,
            password: regPassword,
        });
        console.log(data);
        alert("Registro exitoso");
        setToggle(false); 
        } catch (error) {
        console.error(error);
        alert("Error en registro");
        }
    };

    return (
        <div className={`container ${toggle ? "toggle" : ""}`}>

        {/* LOGIN */}
        <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>

            <div className="container-input">
                <input
                type="email"
                placeholder="Correo"
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button className="button" type="submit">
                Iniciar sesión
            </button>
            </form>
        </div>

        {/* REGISTRO */}
        <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
            <h2>Regístrate</h2>

            <div className="container-input">
                <input
                type="text"
                placeholder="Nombre"
                onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="email"
                placeholder="Correo"
                onChange={(e) => setRegEmail(e.target.value)}
                />
            </div>

            <div className="container-input">
                <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setRegPassword(e.target.value)}
                />
            </div>

            <button className="button" type="submit">
                Registrarse
            </button>
            </form>
        </div>

        {/* PANEL */}
        <div className="container-welcome">
            <div className="welcome welcome-sign-in">
            <h3>¡Bienvenido!</h3>
            <p>¿No tienes cuenta?</p>
            <button className="button" onClick={() => setToggle(true)}>
                Regístrate
            </button>
            </div>

            <div className="welcome welcome-sign-up">
            <h3>¡Hola!</h3>
            <p>¿Ya tienes cuenta?</p>
            <button className="button" onClick={() => setToggle(false)}>
                Iniciar sesión
            </button>
            </div>
        </div>

        </div>
    );
    }
>>>>>>> b6c3afdfe13a2646f20496afdab1dd30aac44751
