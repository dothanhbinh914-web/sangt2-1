import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import UserLayout from './components/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';

// User pages
import HomePage from './pages/HomePage';
import MovieDetail from './pages/MovieDetail';
import WatchPage from './pages/WatchPage';
import FilterPage from './pages/FilterPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminStats from './pages/admin/AdminStats';
import AdminMovies from './pages/admin/AdminMovies';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGenres from './pages/admin/AdminGenres';
import AdminCountries from './pages/admin/AdminCountries';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          {/* Auth pages - no navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin pages - own layout */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminStats />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="episodes" element={<AdminEpisodes />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="countries" element={<AdminCountries />} />
          </Route>

          {/* User pages - with navbar */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/filter" element={<FilterPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
