
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ErrorProvider } from './contexts/ErrorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Vision from './pages/Vision';
import Cinema from './pages/Cinema';
import Live from './pages/Live';
import History from './pages/History';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorProvider>
          <HashRouter>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } />
                <Route path="/vision" element={
                  <PrivateRoute>
                    <Vision />
                  </PrivateRoute>
                } />
                <Route path="/cinema" element={
                  <PrivateRoute>
                    <Cinema />
                  </PrivateRoute>
                } />
                <Route path="/live" element={
                  <PrivateRoute>
                    <Live />
                  </PrivateRoute>
                } />
                <Route path="/history" element={
                  <PrivateRoute>
                    <History />
                  </PrivateRoute>
                } />
              </Routes>
            </DashboardLayout>
          </HashRouter>
        </ErrorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
