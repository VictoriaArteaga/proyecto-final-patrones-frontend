import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import DataStructures from './pages/DataStructures';
import VerifyAccount from './pages/VerifyAccount';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import Layout from './components/Layout';
import { NotificationsProvider } from './context/NotificationsContext';
import { GenerationQueueProvider } from './context/GenerationQueueContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          
          {/* Protected Routes inside Layout */}
          <Route
            element={
              <NotificationsProvider>
                <GenerationQueueProvider>
                  <Layout />
                </GenerationQueueProvider>
              </NotificationsProvider>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/data-structures" element={<DataStructures />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;