import { useState, useEffect } from "react";
import "../animations.css";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Printer, ArrowLeft, User, MapPin, Phone, Hash, Calendar, Tags } from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";

const InvoiceForm = () => {
  const navigate = useNavigate();
  const selectedFirm = JSON.parse(localStorage.getItem("selectedFirm") || "{}");
  const selectedCategory = localStorage.getItem("selectedCategory");
  const selectedType = localStorage.getItem("selectedInvoiceType");

  const [receiver, setReceiver] = useState({
    name: "",
    address: "",
    phone: "",
    gstin: "",
  });

  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNo: "INV-" + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split("T")[0],
  });

  const [items, setItems] = useState([
    {
      id: 1,
      prodName: "",
      huid: "",
      hsn: "7113",
      gsWt: "",
      lessWt: "",
      ntWt: "",
      purity: "22K",
      rate: "",
      mkgCharg: "",
      total: "",
    },
  ]);

  const [totals, setTotals] = useState({
    taxableAmt: 0,
    cgst: 0,
    sgst: 0,
    grandTotal: 0,
    received: 0,
    balance: 0,
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        prodName: "",
        huid: "",
        hsn: "7113",
        gsWt: "",
        lessWt: "",
        ntWt: "",
        purity: "22K",
        rate: "",
        mkgCharg: "",
        total: "",
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        const gsWt = parseFloat(updatedItem.gsWt) || 0;
        const lessWt = parseFloat(updatedItem.lessWt) || 0;
        const rate = parseFloat(updatedItem.rate) || 0;
        const mkgCharg = parseFloat(updatedItem.mkgCharg) || 0;

        const ntWt = gsWt - lessWt;
        updatedItem.ntWt = ntWt.toFixed(3);

        const basicAmt = ntWt * rate;
        const totalMkg = ntWt * mkgCharg;
        const lineTotal = basicAmt + totalMkg;

        updatedItem.total = lineTotal.toFixed(2);
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  useEffect(() => {
    const sumTotal = items.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
    const cgst = sumTotal * 0.015;
    const sgst = sumTotal * 0.015;
    const grandTotal = sumTotal + cgst + sgst;

    setTotals(prev => ({
      ...prev,
      taxableAmt: sumTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      grandTotal: Math.round(grandTotal),
      balance: (Math.round(grandTotal) - (parseFloat(prev.received) || 0)).toFixed(2)
    }));
  }, [items, totals.received]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiver.name.trim()) {
      toast.warn("Client name is required");
      return;
    }
    if (!receiver.phone.trim()) {
      toast.warn("Client phone is required");
      return;
    }
    // Check at least one item with required details
    const hasValidItem = items.some(item => item.prodName.trim() && item.gsWt && item.rate);
    if (!hasValidItem) {
      toast.warn("At least one item with name, gross weight, and rate is required");
      return;
    }

    const invoiceData = {
      firmId: selectedFirm._id,
      invoiceTypeId: selectedType,
      metalType: selectedCategory,
      customerName: receiver.name,
      customerPhone: receiver.phone,
      customerAddress: receiver.address,
      customerGstin: receiver.gstin,
      items: items.map(item => ({
        description: item.prodName,
        huid: item.huid,
        hsn: item.hsn,
        gsWt: parseFloat(item.gsWt) || 0,
        lessWt: parseFloat(item.lessWt) || 0,
        ntWt: parseFloat(item.ntWt) || 0,
        purity: item.purity,
        rate: parseFloat(item.rate) || 0,
        makingCharges: parseFloat(item.mkgCharg) || 0,
        total: parseFloat(item.total) || 0,
      })),
      subTotal: parseFloat(totals.taxableAmt),
      grandTotal: parseFloat(totals.grandTotal),
      received: parseFloat(totals.received),
      invoiceNumber: invoiceMeta.invoiceNo,
    };

    const token = localStorage.getItem("token");
    const loadId = toast.loading("Processing transaction...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.update(loadId, { render: "Invoice saved successfully", type: "success", isLoading: false, autoClose: 2000 });
        localStorage.setItem("generatedInvoice", JSON.stringify(data));
        navigate("/preview");
      } else {
        toast.update(loadId, { render: data.message || "Commit failed", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(loadId, { render: "Network error", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="content-max-width space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <button onClick={() => navigate("/type")} className="text-theme-muted hover:text-theme-teal text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-3xl font-bold text-theme-primary tracking-tight">Invoice <span className="text-theme-teal">Builder</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-[10px] text-theme-muted uppercase font-bold tracking-widest">{selectedFirm.name}</p>
              <input
                className="bg-transparent border-none text-right text-xs text-theme-teal font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/30 rounded px-1 w-32"
                value={invoiceMeta.invoiceNo}
                onChange={e => setInvoiceMeta({ ...invoiceMeta, invoiceNo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-modern space-y-6 animate-fade-in delay-100">
              <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-theme-teal">
                  <User className="w-4 h-4" />
                </div>
                Client Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-theme-muted ml-1 font-bold flex items-center gap-1"><User className="w-3 h-3" /> CLIENT NAME</span>
                  <input className="input-field" placeholder="Full Name" value={receiver.name} onChange={e => setReceiver({ ...receiver, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-theme-muted ml-1 font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> PHONE NO.</span>
                  <input
                    className="input-field"
                    placeholder="Enter 10 Digit Phone"
                    value={receiver.phone}
                    maxLength={10}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setReceiver({ ...receiver, phone: val });
                    }}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] text-theme-muted ml-1 font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> ADDRESS</span>
                  <input className="input-field" placeholder="Complete address..." value={receiver.address} onChange={e => setReceiver({ ...receiver, address: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card-modern space-y-6 animate-fade-in delay-200">
              <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-theme-teal">
                  <Calendar className="w-4 h-4" />
                </div>
                Metadata
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 ml-1 font-bold flex items-center gap-1"><Hash className="w-3 h-3" /> INVOICE NO.</span>
                  <input className="input-field font-mono" value={invoiceMeta.invoiceNo} onChange={e => setInvoiceMeta({ ...invoiceMeta, invoiceNo: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 ml-1 font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> INVOICE DATE</span>
                  <input type="date" className="input-field" value={invoiceMeta.date} onChange={e => setInvoiceMeta({ ...invoiceMeta, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 ml-1 font-bold flex items-center gap-1"><Tags className="w-3 h-3" /> GSTIN (IF ANY)</span>
                  <input className="input-field font-mono text-xs" placeholder="Optional" value={receiver.gstin} onChange={e => setReceiver({ ...receiver, gstin: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card-modern !p-0 overflow-hidden border-white/5 shadow-xl">
            <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs md:text-sm font-extrabold bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-900/20 transition-all duration-200 active:scale-95 group"
              >
                <span className="inline-block transition-transform duration-300 group-hover:rotate-90">
                  <Plus className="w-4 h-4" />
                </span>
                Add Item
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-[10px] min-w-[900px]">
                <thead className="bg-white/5 border-b border-white/5 text-gray-400 uppercase whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-4 text-left min-w-[180px]">Product</th>
                    <th className="px-3 py-4 w-24">HUID</th>
                    <th className="px-3 py-4 text-right w-24">Gross</th>
                    <th className="px-3 py-4 text-right w-24">Net</th>
                    <th className="px-3 py-4 w-20">Purity</th>
                    <th className="px-3 py-4 text-right w-32">Rate</th>
                    <th className="px-3 py-4 text-right w-24">Mkg.</th>
                    <th className="px-4 py-4 text-right w-32">Total</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm whitespace-nowrap">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-4">
                        <input className="bg-transparent border-none outline-none w-full focus:text-teal-400" placeholder="Item name" value={item.prodName} onChange={e => handleItemChange(item.id, 'prodName', e.target.value)} />
                      </td>
                      <td className="px-3 py-4 text-center">
                        <input className="bg-transparent border-none outline-none w-full text-center focus:text-teal-400 font-mono" placeholder="-" value={item.huid} onChange={e => handleItemChange(item.id, 'huid', e.target.value)} />
                      </td>
                      <td className="px-3 py-4 text-right font-bold">
                        <input type="number" className="bg-transparent border-none outline-none w-full text-right focus:text-teal-400" placeholder="0" value={item.gsWt} onChange={e => handleItemChange(item.id, 'gsWt', e.target.value)} />
                      </td>
                      <td className="px-3 py-4 text-right text-teal-500 font-bold">{item.ntWt || '0.00'}</td>
                      <td className="px-3 py-4 text-center">
                        <input className="bg-transparent border-none outline-none w-full text-center focus:text-teal-400" value={item.purity} onChange={e => handleItemChange(item.id, 'purity', e.target.value)} />
                      </td>
                      <td className="px-3 py-4 text-right">
                        <input type="number" className="bg-transparent border-none outline-none w-full text-right focus:text-teal-400 font-mono" placeholder="0" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} />
                      </td>
                      <td className="px-3 py-4 text-right">
                        <input type="number" className="bg-transparent border-none outline-none w-full text-right focus:text-teal-400" placeholder="0" value={item.mkgCharg} onChange={e => handleItemChange(item.id, 'mkgCharg', e.target.value)} />
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-theme-primary">₹{(parseFloat(item.total) || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-center">
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col md:flex-row justify-between gap-8 py-8 border-t border-white/10">
            <div className="flex-1 max-w-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Cash Received</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    className="input-field !py-4 !pl-10 text-xl font-bold font-mono"
                    placeholder="0"
                    value={totals.received}
                    onChange={e => setTotals({ ...totals, received: e.target.value })}
                    onFocus={() => setTotals({ ...totals, received: "" })}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Remaining Balance</span>
                <span className={`text-lg font-bold font-mono ${(parseFloat(totals.balance) || 0) > 0 ? 'text-red-500' : 'text-teal-500'}`}>
                  ₹{Math.abs(parseFloat(totals.balance) || 0).toLocaleString()} {(parseFloat(totals.balance) || 0) > 0 ? 'DR' : 'CR'}
                </span>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-xs text-theme-muted px-1"><span>Taxable Value</span> <span className="text-theme-primary font-mono">₹{(parseFloat(totals.taxableAmt) || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-xs text-theme-muted px-1"><span>GST (3%)</span> <span className="text-theme-secondary font-mono">₹{((parseFloat(totals.cgst) || 0) + (parseFloat(totals.sgst) || 0)).toLocaleString()}</span></div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center bg-teal-500/10 p-4 rounded-xl border border-teal-500/20">
                <span className="text-sm font-bold text-theme-primary uppercase tracking-tight">Net Amount</span>
                <span className="text-2xl font-bold text-theme-primary font-mono">₹{(parseFloat(totals.grandTotal) || 0).toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full btn-primary !rounded-xl !py-4 shadow-xl mt-4">
                <Printer className="w-5 h-5" /> Save & Print
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
