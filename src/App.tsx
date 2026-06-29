import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Storage } from '@/pages/Storage';
import { Settings } from '@/pages/Settings';
import { Admin } from '@/pages/Admin';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Admin route */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;