import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './utils/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/CategorySelect';
import InvoiceType from './pages/InvoiceType';
import InvoiceForm from './pages/InvoiceForm';
import InvoicePreview from './pages/InvoicePreview';
import InvoiceHistory from './pages/InvoiceHistory';
import ProtectedRoute from './components/ProtectedRoute';

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        window.location.href = "/";
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen selection:bg-teal-500/30">
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><InvoiceHistory /></ProtectedRoute>} />
            <Route path="/category" element={<ProtectedRoute><CategorySelect /></ProtectedRoute>} />
            <Route path="/type" element={<ProtectedRoute><InvoiceType /></ProtectedRoute>} />
            <Route path="/invoice-form" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
            <Route path="/preview" element={<ProtectedRoute><InvoicePreview /></ProtectedRoute>} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
