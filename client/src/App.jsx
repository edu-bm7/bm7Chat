import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './Login.jsx';
import ErrorPage from './ErrorPage.jsx';
import AppLayout from './AppLayout.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx'
import './App.css';

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" /> : <Navigate to="/login" />} />
      <Route exact path="/login" element={<LoginPage showLogin={showLogin} onToggleView={() => setShowLogin(!showLogin)} />} />
      <Route path="/app" element={<AppLayout />} />
      <Route path="/error" element={<ErrorPage />} />
    </Routes>
  );
}

export default AppWrapper;
