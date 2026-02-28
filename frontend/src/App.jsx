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

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen selection:bg-teal-500/30">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/category" element={<CategorySelect />} />
            <Route path="/type" element={<InvoiceType />} />
            <Route path="/invoice-form" element={<InvoiceForm />} />
            <Route path="/preview" element={<InvoicePreview />} />
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
