import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import axiosInstance from './config/axios';
import { API_ENDPOINTS } from './config/api';
import { useTranslation } from 'react-i18next';
import './styles/main.css';
import { ThemeProvider, useTheme as useAppTheme } from './context/ThemeContext';


// Components & Pages
import ThisPageHead from './components/Header.jsx';
import MainNavbar from './components/NavBars/MainNavbar.jsx';
import AuthNavbar from './components/NavBars/AuthNavbar.jsx';
import Footer from './components/Footer.jsx';
import Error404 from './components/Error404.jsx';
import logo_dark from './assets/train-sync-high-resolution-logo-Photoroom.png';

// Public Pages
import Home from './pages/PreAuth/Home/Home';
import About from './pages/PreAuth/About/AboutPage';
import Contact from './pages/PreAuth/ContactUs/ContactPage';
import PrivacyPolicy from './pages/PreAuth/PrivacyPolicy/PrivacyPolicy';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import CareersPage from './pages/PreAuth/Careers/Careers';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import FeaturesPage from './pages/PreAuth/Features/FeaturesPage';
import ForIndividuals from './pages/PreAuth/Features/ForIndividuals';
import ForCoaches from './pages/PreAuth/Features/ForCoaches';
import SharedFeatures from './pages/PreAuth/Features/SharedFeatures';
import PricingPage from './pages/PreAuth/Pricing/PricingPage';
import PlatformUpdates from './pages/PreAuth/Blog/PlatformUpdates';
import FitnessTips from './pages/PreAuth/Blog/FitnessTips';
import InviteSignup from './pages/InviteSignup/InviteSignup';

// User Dashboard Pages
import UserDashboard from './pages/Dashboards/UserDashboard/UserDashboard';
import Settings from './pages/Dashboards/UserDashboard/Settings';
import UserExercises from './pages/Dashboards/UserDashboard/UserExercises';
import UserProgress from './pages/Dashboards/UserDashboard/UserProgress';
import UserMealPlans from './pages/Dashboards/UserDashboard/UserMealPlans';

// Admin Dashboard Pages
import AdminDashboard from './pages/Dashboards/AdminDashboard/AdminDashboard';
import UserManagement from './pages/Dashboards/AdminDashboard/UserManagement';
import AdminSettings from './pages/Dashboards/AdminDashboard/AdminSettings';
import AllTrainingPlans from './pages/Dashboards/AdminDashboard/Resources/AllTrainingPlans';
import AllMealPlans from './pages/Dashboards/AdminDashboard/Resources/AllMealPlans';
import ViewMealPlan from './pages/Dashboards/AdminDashboard/Resources/ViewMealPlan';
import ViewTrainingPlan from './pages/Dashboards/AdminDashboard/Resources/ViewTrainingPlan';
import Audit from './pages/Dashboards/AdminDashboard/Analytics/Audit';

// Coach Dashboard Pages
import CoachDashboard from './pages/Dashboards/CoachDashboard/CoachDashboard';
import CoachSettings from './pages/Dashboards/CoachDashboard/BusinessOperations/CoachSettings';
import CoachClients from './pages/Dashboards/CoachDashboard/CoachClients';
import TrainingPlans from './pages/Dashboards/CoachDashboard/ContentAndResources/TrainingPlans';
import PlanExercises from './pages/Dashboards/CoachDashboard/ContentAndResources/PlanExercises';
import MealPlans from './pages/Dashboards/CoachDashboard/ContentAndResources/MealPlans';
import Meals from './pages/Dashboards/CoachDashboard/ContentAndResources/Meals';
import ClientProgress from './pages/Dashboards/CoachDashboard/ClientManagement/ClientProgress';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const shouldShowNavAndFooter = !['/dashboard', '/admin', '/coach'].some(path => location.pathname.includes(path));

  return (
    <>
      {shouldShowNavAndFooter && (isAuthenticated ? <AuthNavbar /> : <MainNavbar />)}
      {children}
      {shouldShowNavAndFooter && <Footer />}
    </>
  );
};

// Protected Routes Mapping
const generateRoutes = (routes, Wrapper) =>
  routes.map(({ path, element }) => (
    <Route key={path} path={path} element={Wrapper(element)} />
  ));

const userRoutes = [
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/dashboard/settings', element: <Settings /> },
  { path: '/dashboard/exercises', element: <UserExercises /> },
  { path: '/dashboard/progress', element: <UserProgress /> },
  { path: '/dashboard/meal-plans', element: <UserMealPlans /> },
];

const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/users', element: <UserManagement /> },
  { path: '/admin/settings', element: <AdminSettings /> },
  { path: '/admin/training-plans', element: <AllTrainingPlans /> },
  { path: '/admin/meal-plans', element: <AllMealPlans /> },
  { path: '/admin/meal-plans/:id/meals', element: <ViewMealPlan /> },
  { path: '/admin/training-plans/:id', element: <ViewTrainingPlan /> },
  { path: '/admin/logs', element: <Audit /> },
];

const coachRoutes = [
  { path: '/coach', element: <CoachDashboard /> },
  { path: '/coach/clients', element: <CoachClients /> },
  { path: '/coach/training-plans', element: <TrainingPlans /> },
  { path: '/coach/training-plans/:planId/exercises', element: <PlanExercises /> },
  { path: '/coach/meal-plans', element: <MealPlans /> },
  { path: '/coach/meal-plans/:planId/meals', element: <Meals /> },
  { path: '/coach/settings', element: <CoachSettings /> },
  { path: '/coach/client-progress', element: <ClientProgress /> },
];

// Main App Component
function App() {
  const { t } = useTranslation();

  // Wrapper functions for protected routes with theme
  const wrapUserRoute = (element) => {
    return (
      <ProtectedRoute>
        <ThemeProvider>
          {element}
        </ThemeProvider>
      </ProtectedRoute>
    );
  };

  const wrapAdminRoute = (element) => {
    return (
      <AdminRoute>
        <ThemeProvider>
          {element}
        </ThemeProvider>
      </AdminRoute>
    );
  };

  const wrapCoachRoute = (element) => {
    return (
      <CoachRoute>
        <ThemeProvider>
          {element}
        </ThemeProvider>
      </CoachRoute>
    );
  };

  return (
    <>
      <ThisPageHead favicon={logo_dark} title="Train-Sync" />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes - No Theme Provider */}
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/features/individuals" element={<ForIndividuals />} />
            <Route path="/features/coaches" element={<ForCoaches />} />
            <Route path="/features/shared" element={<SharedFeatures />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/resources/updates" element={<PlatformUpdates />} />
            <Route path="/resources/fitness-tips" element={<FitnessTips />} />
            <Route path="/invite-signup" element={<InviteSignup />} />
            <Route path="*" element={<Error404 />} />

            {/* Protected Routes with Theme Provider */}
            {generateRoutes(userRoutes, wrapUserRoute)}
            {generateRoutes(adminRoutes, wrapAdminRoute)}
            {generateRoutes(coachRoutes, wrapCoachRoute)}
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}

// Protected Route Components
const ProtectedRoute = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance.get(API_ENDPOINTS.auth.me).then(res => {
      if (res.data.user_type !== 'admin') navigate('/dashboard');
      setIsAdmin(res.data.user_type === 'admin');
    }).catch(() => navigate('/login'));
  }, [navigate]);
  return isAdmin ? children : <CircularProgress />;
};

const CoachRoute = ({ children }) => {
  const [isCoach, setIsCoach] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance.get(API_ENDPOINTS.auth.me).then(res => {
      if (res.data.user_type !== 'coach') navigate('/dashboard');
      setIsCoach(res.data.user_type === 'coach');
    }).catch(() => navigate('/login'));
  }, [navigate]);
  return isCoach ? children : <CircularProgress />;
};

export default App;
