import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import AuthService from './services/AuthService';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Employee from './pages/Employee';
import Department from './pages/Department';
import Salary from './pages/Salary';
import Payroll from './pages/Payroll';
import Bonus from './pages/Bonus';
import Deduction from './pages/Deduction';
import UserProfil from './pages/UserProfil';
import ForgotPswd from './pages/ForgotPswd';
import ResetPswd from './pages/ResetPswd';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PreLoader from './components/Preloader';
import Footer from './components/Footer';

function LayoutWrapper() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAuthenticated = AuthService.isAuthenticated();

  useEffect(() => {
    // Préloader
    setTimeout(() => {
      const loader = document.querySelector('.loader-bg');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    }, 1000);

    const loadScripts = async () => {
      await new Promise(resolve => {
        const checkBootstrap = () => {
          if (window.bootstrap) return resolve();
          setTimeout(checkBootstrap, 100);
        };
        checkBootstrap();
      });

      if (window.feather) window.feather.replace();
    };

    loadScripts();
  }, [location]);

  // Rediriger vers login si non authentifié et pas sur une page d'authentification
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rediriger vers le Home si déjà authentifié et sur login/register
  if (isAuthenticated && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="content">
      <PreLoader />

      {/* Ne pas afficher Navbar et Sidebar sur les pages d'authentification */}
      {!isAuthPage && (
        <>
          <Navbar />
          <Sidebar />
        </>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPswd />} />
        <Route path="/reset-password" element={<ResetPswd />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employes" element={<Employee />} />
        <Route path="/department" element={<Department />} />
        <Route path="/salary" element={<Salary />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/bonus" element={<Bonus />} />
        <Route path="/deduction" element={<Deduction />} />
        <Route path="/profil" element={<UserProfil />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>

      {/* Ne pas afficher Footer sur les pages d'authentification */}
      {!isAuthPage && <Footer />}

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;