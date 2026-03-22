import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import { apiFetch } from "../utils/api";

// This is a simplified version. You can expand it to match InvoiceForm.jsx features.
const InvoiceEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editAllowed, setEditAllowed] = useState(false);

  useEffect(() => {
    if (!invoice) {
      toast.error("No invoice selected for editing");
      navigate("/history");
      return;
    }
    setForm(invoice);
    // Check if within 1 day
    const createdAt = new Date(invoice.createdAt);
    const now = new Date();
    setEditAllowed(now - createdAt < 24 * 60 * 60 * 1000);
    setLoading(false);
  }, [invoice, navigate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editAllowed) {
      toast.error("Editing period expired");
      return;
    }
    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/invoices/${form._id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        },
      );
      if (res && res.ok) {
        toast.success("Invoice updated");
        navigate("/history");
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Update failed" }));
        toast.error(errorData.message || "Update failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!form) return null;

  return (
    <div className="page-container fade-in">
      <div className="content-max-width space-y-8">
        <div className="flex justify-between items-center pb-6 border-b border-white/5">
          <h1 className="text-3xl font-bold text-theme-primary tracking-tight">
            Edit Invoice
          </h1>
          <ThemeToggle />
        </div>
        {!editAllowed && (
          <div className="text-red-500 font-bold">
            Editing is only allowed within 1 day of creation.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-bold mb-1">
              Customer Name
            </label>
            <input
              className="input-field"
              value={form.customerName || ""}
              onChange={(e) => handleChange("customerName", e.target.value)}
              disabled={!editAllowed}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Phone</label>
            <input
              className="input-field"
              value={form.customerPhone || ""}
              onChange={(e) => handleChange("customerPhone", e.target.value)}
              disabled={!editAllowed}
            />
          </div>
          {/* Add more fields as needed */}
          <button type="submit" className="btn-primary" disabled={!editAllowed}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEditor;
