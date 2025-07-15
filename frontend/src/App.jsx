import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import Book from './pages/Book';
import FAQ from './pages/FAQ';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Libraries from './pages/Libraries';
import LibraryInfo from './pages/LibraryInfo';
import ManagerCatalog from './pages/ManagerCatalog';
import ManagerOrders from './pages/ManagerOrders';
import ManagerLibrary from './pages/ManagerLibrary';
import ManagerBook from './pages/ManagerBook';
import ManagerNewBook from './pages/ManagerNewBook';
import { AuthProvider } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import AdminLibraries from './pages/AdminLibraries';
import AdminLibrary from './pages/AdminLibrary';
import AdminNewLibrary from './pages/AdminNewLibrary';

export function PrivateRoute({ children, role='user'}) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; 
  if (!user){
    return <Navigate to="/" replace />
  }
  if (role != 'user' && (user.role == 'user' || (role != 'manager' && user.role == 'manager'))) return <Navigate to="/" replace />; 
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
          <Route path="/libraries" element={<Libraries />} />
          <Route path="/libraries/:id" element={<LibraryInfo />} />
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
          
          <Route
            path="/manager/"
            element={
              <PrivateRoute role='manager'>
                <ManagerCatalog />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/orders"
            element={
              <PrivateRoute role='manager'>
                <ManagerOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/library"
            element={
              <PrivateRoute role='manager'>
                <ManagerLibrary />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/books/:id"
            element={
              <PrivateRoute role='manager'>
                <ManagerBook />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/new"
            element={
              <PrivateRoute role='manager'>
                <ManagerNewBook />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/"
            element={
              <PrivateRoute role='admin'>
                <AdminLibraries />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <PrivateRoute role='admin'>
                <AdminNewLibrary />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/libraries/:id"
            element={
              <PrivateRoute role='admin'>
                <AdminLibrary />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
