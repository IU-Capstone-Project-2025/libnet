import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import Book from './pages/Book';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Footer from './components/Footer';

export function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/books/:id" element={<Book/>} />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
