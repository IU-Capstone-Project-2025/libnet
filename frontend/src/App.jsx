import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
