import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/public/HomePage';
import MangaDetailPage from './pages/public/MangaDetailPage';
import LoginPage from './pages/auth/LoginPage';
import SetPasswordPage from './pages/auth/SetPasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProjectStudioPage from './pages/admin/ProjectStudioPage';
import SettingsPage from './pages/admin/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthInterceptor } from './components/auth/AuthInterceptor';

export default function App() {
  return (
    <Router>
      <AuthInterceptor />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#111827',
            color: '#fff',
            fontSize: '14px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          },
        }} 
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/manga/:id" element={<MangaDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route 
          path="/admin/project/:id" 
          element={
            <ProtectedRoute>
              <ProjectStudioPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
