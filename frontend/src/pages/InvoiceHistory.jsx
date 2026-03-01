import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Trash2,
    Eye,
    Calendar,
    User,
    Hash,
    IndianRupee,
    Clock,
    Filter,
    X,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Building2
} from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { apiFetch } from "../utils/api";

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [firms, setFirms] = useState([]);
    const [invoiceTypes, setInvoiceTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFirmId, setSelectedFirmId] = useState("");
    const [selectedInvoiceTypeId, setSelectedInvoiceTypeId] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const location = useLocation();

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices`);
            if (res && res.ok) {
                const data = await res.json();
                setInvoices(data);

                // Extract unique firms and invoice types for filters
                const uniqueFirms = [];
                const firmIds = new Set();
                const uniqueTypes = [];
                const typeIds = new Set();

                data.forEach(inv => {
                    const firm = inv.firmId;
                    if (firm && typeof firm === 'object' && firm._id && !firmIds.has(firm._id)) {
                        firmIds.add(firm._id);
                        uniqueFirms.push(firm);
                    }

                    const type = inv.invoiceTypeId;
                    if (type && typeof type === 'object' && type._id && !typeIds.has(type._id)) {
                        typeIds.add(type._id);
                        uniqueTypes.push(type);
                    }
                });

                setFirms(uniqueFirms);
                setInvoiceTypes(uniqueTypes);

                // Initial filter if coming from builder
                const initialFirmId = location.state?.initialFirmId;
                if (initialFirmId) {
                    setSelectedFirmId(initialFirmId);
                }
            } else {
                toast.error("Failed to fetch invoices");
            }
        } catch (err) {
            toast.error("Network error: Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        const filtered = invoices.filter((inv) => {
            const matchesFirm = selectedFirmId ? inv.firmId?._id === selectedFirmId : true;
            const matchesInvoiceType = selectedInvoiceTypeId ? inv.invoiceTypeId?._id === selectedInvoiceTypeId : true;

            // Date filtering (YYYY-MM-DD comparison)
            const invDate = inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : "";
            const matchesDate = dateFilter ? invDate === dateFilter : true;

            // Search (optional, can still search by invoice number or customer)
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = searchTerm ? (
                inv.invoiceNumber?.toLowerCase().includes(searchStr) ||
                inv.customerName?.toLowerCase().includes(searchStr)
            ) : true;

            return matchesFirm && matchesInvoiceType && matchesDate && matchesSearch;
        });
        setFilteredInvoices(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, invoices, selectedFirmId, selectedInvoiceTypeId, dateFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleView = (invoice) => {
        localStorage.setItem("generatedInvoice", JSON.stringify(invoice));
        navigate("/preview", {
            state: {
                from: "history",
                originalState: location.state // Preserve where History came from
            }
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}`, {
                method: "DELETE",
            });
            if (res && res.ok) {
                toast.success("Invoice deleted successfully");
                setInvoices(invoices.filter((inv) => inv._id !== id));
            } else {
                toast.error("Failed to delete invoice");
            }
        } catch (err) {
            toast.error("Error deleting invoice");
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleBack = () => {
        if (location.state?.from === "dashboard") {
            navigate("/dashboard");
        } else if (location.state?.from === "builder") {
            navigate("/invoice-form");
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="page-container">
            <div className="content-max-width space-y-8">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-1 text-center md:text-left">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-theme-muted hover:text-theme-teal transition-all font-bold text-xs mb-2 uppercase tracking-tight mx-auto md:mx-0"
                        >
                            <ArrowLeft className="w-3 h-3" /> Go Back
                        </button>
                        <h1 className="text-3xl font-bold text-theme-primary tracking-tight">
                            Invoice <span className="text-theme-teal">History</span>
                        </h1>
                        <p className="text-theme-secondary text-sm">
                            {selectedFirmId ? `Viewing invoices for ${firms.find(f => f._id === selectedFirmId)?.name || 'selected firm'}` : "Manage and review all your previously generated invoices"}
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Filter Toolbar - Below Heading */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-fade-in relative z-30">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end w-full ${location.state?.initialFirmId ? 'lg:max-w-[560px] lg:grid-cols-2' : 'lg:max-w-3xl'}`}>
                        {/* Firm Filter Dropdown - Only available if NOT from Builder */}
                        {!location.state?.initialFirmId && (
                            <div className="space-y-1.5 flex-1">
                                <p className="text-[10px] font-extrabold text-theme-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-theme-teal" /> SELECT UNIT
                                </p>
                                <Dropdown
                                    options={firms}
                                    value={selectedFirmId}
                                    onChange={setSelectedFirmId}
                                    placeholder="All Firms"
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Invoice Type Filter */}
                        <div className="space-y-1.5 flex-1">
                            <p className="text-[10px] font-extrabold text-theme-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Filter className="w-3 h-3 text-theme-teal" /> INVOICE TYPE
                            </p>
                            <Dropdown
                                options={invoiceTypes}
                                value={selectedInvoiceTypeId}
                                onChange={setSelectedInvoiceTypeId}
                                placeholder="All Types"
                                className="w-full"
                            />
                        </div>

                        {/* Date Selection Filter - Custom DatePicker */}
                        <div className="space-y-1.5 flex-1">
                            <p className="text-[10px] font-extrabold text-theme-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3 text-theme-teal" /> CHOOSE DATE
                            </p>
                            <DatePicker
                                value={dateFilter}
                                onChange={setDateFilter}
                                placeholder="Pick a date"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="space-y-1.5 w-full lg:max-w-sm">
                        <p className="text-[10px] font-extrabold text-theme-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Search className="w-3 h-3 text-theme-teal" /> SEARCH RECORDS
                        </p>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                            <input
                                type="text"
                                placeholder="Client name or invoice #..."
                                className="input-field !pl-10 h-[46px] text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* List Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <Clock className="w-12 h-12 text-theme-teal/20 mb-4 animate-spin-slow" />
                        <p className="text-theme-muted font-bold tracking-widest uppercase text-xs">Loading records...</p>
                    </div>
                ) : filteredInvoices.length > 0 ? (
                    <div className="card-modern !p-0 overflow-hidden animate-fade-in border-white/10 relative z-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Invoice #</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest text-center">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Firm</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedInvoices.map((inv, index) => (
                                        <tr
                                            key={inv._id}
                                            className="group hover:bg-theme-teal/5 transition-all duration-300"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-theme-teal/10 flex items-center justify-center text-theme-teal group-hover:bg-theme-teal group-hover:text-white transition-all">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-theme-primary">{inv.customerName || "Walk-in"}</div>
                                                        <div className="text-[10px] text-theme-muted">{inv.customerPhone || "No Phone"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-theme-secondary">
                                                {inv.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-theme-secondary">
                                                {formatDate(inv.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${inv.invoiceTypeId?.name?.toLowerCase().includes('cash')
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    : 'bg-theme-teal/10 text-theme-teal border border-theme-teal/20'
                                                    }`}>
                                                    {inv.invoiceTypeId?.name || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-theme-teal/5 border border-theme-teal/10 px-2 py-0.5 rounded-full text-theme-teal font-bold uppercase tracking-wider">
                                                    {inv.firmId?.name || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-theme-primary flex items-center justify-end gap-1">
                                                    <IndianRupee className="w-3 h-3 text-theme-teal" />
                                                    {inv.grandTotal?.toLocaleString("en-IN") || "0"}
                                                </div>
                                                <div className="text-[9px] text-theme-muted font-bold uppercase">{inv.metalType}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(inv)}
                                                        className="p-2 rounded-lg bg-theme-teal/10 text-theme-teal hover:bg-theme-teal hover:text-white transition-all"
                                                        title="View Invoice"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(inv._id)}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        title="Delete Invoice"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-xs text-theme-muted">
                                    Showing <span className="text-theme-primary font-bold">{indexOfFirstItem + 1}</span> to <span className="text-theme-primary font-bold">{Math.min(indexOfLastItem, filteredInvoices.length)}</span> of <span className="text-theme-primary font-bold">{filteredInvoices.length}</span> records
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white/5 text-theme-secondary hover:bg-theme-teal/10 hover:text-theme-teal disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-theme-secondary transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Show first, last, and pages around current
                                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                                            ${currentPage === page
                                                                ? 'bg-theme-teal text-white shadow-lg shadow-teal-500/20'
                                                                : 'bg-white/5 text-theme-secondary hover:bg-white/10'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (page === 2 || page === totalPages - 1) {
                                                return <span key={page} className="text-theme-muted px-1 text-xs">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-white/5 text-theme-secondary hover:bg-theme-teal/10 hover:text-theme-teal disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-theme-secondary transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 card-modern border-dashed border-white/10 opacity-60">
                        <Filter className="w-16 h-16 text-theme-muted mb-6 stroke-[1]" />
                        <h3 className="text-xl font-bold text-theme-secondary mb-2">No Invoices Found</h3>
                        <p className="text-theme-muted text-sm max-w-xs text-center">
                            {searchTerm ? `We couldn't find any results for "${searchTerm}"` : "You haven't generated any invoices yet."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-6 text-theme-teal font-bold text-sm hover:underline"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceHistory;
