import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BrowsePets from './pages/BrowsePets';
import PetDetails from './pages/PetDetails';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Stores from './pages/Stores';
import StoreDetails from './pages/StoreDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import StoreDashboard from './pages/StoreDashboard';
import ServiceDashboard from './pages/ServiceDashboard';
import CareGuides from './pages/CareGuides';
import NgoInfo from './pages/NgoInfo';
import Appointments from './pages/Appointments';

// Dummy placeholders for undefined protected routes
const DashboardPlaceholder = ({ title }) => <div className="page-container" style={{textAlign: 'center', marginTop: '4rem'}}><h2>{title}</h2><p>This protected area is working.</p></div>;

function App() {
  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pets" element={<BrowsePets />} />
            <Route path="/pets/:id" element={<PetDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/stores/:id" element={<StoreDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/store-dashboard" element={<ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']}><StoreDashboard /></ProtectedRoute>} />
            <Route path="/service-dashboard" element={<ProtectedRoute allowedRoles={['SERVICE_PROVIDER', 'ADMIN']}><ServiceDashboard /></ProtectedRoute>} />
             <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/care-guides" element={<CareGuides />} />
            <Route path="/ngo-info" element={<NgoInfo />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
