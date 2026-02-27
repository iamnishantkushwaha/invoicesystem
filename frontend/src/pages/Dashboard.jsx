import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, ArrowRight, LogOut, Search, Hash } from "lucide-react";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [firms, setFirms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFirm, setNewFirm] = useState({ name: "", address: "", gstNumber: "", phone: "" });
  const navigate = useNavigate();

  const fetchFirms = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/firms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFirms(data);
    } catch (err) {
      toast.error("Network error: Failed to fetch firms");
    }
  };

  useEffect(() => {
    fetchFirms();
  }, [navigate]);

  const selectFirm = (firm) => {
    localStorage.setItem("selectedFirm", JSON.stringify(firm));
    toast.success(`${firm.name} selected successfully`);
    navigate("/category");
  };

  const handleAddFirm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/firms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFirm),
      });
      if (res.ok) {
        toast.success("Firm added successfully");
        setIsModalOpen(false);
        setNewFirm({ name: "", address: "", gstNumber: "", phone: "" });
        fetchFirms();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add firm");
      }
    } catch (err) {
      toast.error("Error adding firm");
    }
  };

  const filteredFirms = firms.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="content-max-width space-y-8">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Select <span className="text-teal-400">Firm</span>
            </h1>
            <p className="text-gray-400 text-sm">Choose an entity to start generating invoices</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search firm or GST..."
                className="input-field !pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
                toast.info("Logged out successfully");
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-white/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Improved Simple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms.map((firm, index) => (
            <button
              key={firm._id}
              onClick={() => selectFirm(firm)}
              className="card-modern group text-left flex flex-col items-start h-full animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 group-hover:rotate-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-all uppercase leading-tight">
                {firm.name}
              </h3>
              <div className="mt-1 space-y-2 mb-8">
                <span className="text-[10px] font-mono bg-white/5 py-1 px-2 rounded-md text-gray-400 border border-white/5 flex items-center gap-1 w-fit">
                  <Hash className="w-3 h-3" /> {firm.gstNumber}
                </span>
                <p className="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed h-8">
                  {firm.address}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-teal-400 font-bold text-xs opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Access Unit <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}

          {/* Add New Unit Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="card-modern border-dashed border-white/20 flex flex-col items-center justify-center text-center p-10 hover:border-teal-500/50 group transition-all animate-fade-in delay-300"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-4 group-hover:border-teal-500 group-hover:bg-teal-500/5 transition-all duration-300">
              <Plus className="w-8 h-8 text-gray-500 group-hover:text-teal-500 group-hover:rotate-90 transition-all duration-300" />
            </div>
            <span className="text-xs font-bold text-gray-500 group-hover:text-teal-500 uppercase tracking-widest transition-colors">Register New Firm</span>
          </button>
        </div>
      </div>

      {/* Add Firm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg card-modern !p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Register <span className="text-teal-400">Firm</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddFirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Firm Name</label>
                <input
                  className="input-field"
                  placeholder="e.g., AARAMBH JEWELS"
                  value={newFirm.name}
                  onChange={e => setNewFirm({ ...newFirm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">GST Number</label>
                <input
                  className="input-field font-mono"
                  placeholder="23XXXXX..."
                  value={newFirm.gstNumber}
                  onChange={e => setNewFirm({ ...newFirm, gstNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                <input
                  className="input-field"
                  placeholder="10 digit phone number"
                  value={newFirm.phone}
                  maxLength={10}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setNewFirm({ ...newFirm, phone: val });
                  }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Business Address</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="Street, City, State..."
                  value={newFirm.address}
                  onChange={e => setNewFirm({ ...newFirm, address: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary !py-3">Cancel</button>
                <button type="submit" className="flex-1 btn-primary !py-3">Create Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
