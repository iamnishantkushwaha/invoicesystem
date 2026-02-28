import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tags, ArrowLeft, LogOut } from "lucide-react";

import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";

const InvoiceType = () => {
  const navigate = useNavigate();
  const selectedFirm = JSON.parse(localStorage.getItem("selectedFirm") || "{}");
  const selectedCategory = localStorage.getItem("selectedCategory");

  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoice-types`);
        const data = await res.json();
        if (res.ok) setTypes(data);
      } catch (err) {
        toast.error("Failed to load invoice types");
      }
    };
    fetchTypes();
  }, []);

  const handleSelect = (type) => {
    if (type && type._id) {
      localStorage.setItem("selectedInvoiceType", type._id);
      navigate("/invoice-form");
    } else {
      toast.error("Selection error: Invalid type data");
    }
  };

  return (
    <div className="page-container">
      <div className="content-max-width">
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate("/category")}
            className="flex items-center gap-2 text-theme-muted hover:text-theme-teal transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Categories
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
                toast.info("Logged out successfully");
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-white/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-theme-teal text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
              {selectedFirm.name}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 text-theme-muted text-[10px] font-bold uppercase tracking-widest border border-white/10">
              {selectedCategory}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-theme-primary mb-4">
            Select <span className="text-theme-teal">Bill Type</span>
          </h1>
          <p className="text-theme-secondary text-sm max-w-md mx-auto">
            Choose what kind of bill you want to create right now.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {types.map((type, index) => (
            <button
              key={type._id}
              onClick={() => handleSelect(type)}
              className="card-modern flex flex-col items-center text-center group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                <Tags className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-theme-teal transition-all uppercase">
                {type.title}
              </h3>
              <p className="text-theme-secondary text-xs">
                {type.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceType;
