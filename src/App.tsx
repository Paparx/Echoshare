import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import Events from './pages/Events';
import Cleanup from './pages/Cleanup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );
  
  // Use replace to avoid getting stuck in back-button loops
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />
      
      <Route path="/items" element={
        <Layout>
          <Items />
        </Layout>
      } />
      
      <Route path="/items/add" element={
        <PrivateRoute>
          <Layout>
            <AddItem />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/events" element={
        <Layout>
          <Events />
        </Layout>
      } />
      
      <Route path="/cleanup" element={
        <Layout>
          <Cleanup />
        </Layout>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
