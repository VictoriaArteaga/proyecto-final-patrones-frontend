<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register'; // NUEVO: Importamos el Registro
import Dashboard from './pages/Dashboard';
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
>>>>>>> b6c3afdfe13a2646f20496afdab1dd30aac44751

function App() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* NUEVO: La ruta */}
        <Route path="/dashboard" element={<Dashboard />} />
=======
      <Routes>
        <Route path="/" element={<Login />} />
>>>>>>> b6c3afdfe13a2646f20496afdab1dd30aac44751
      </Routes>
    </BrowserRouter>
  );
}

export default App;