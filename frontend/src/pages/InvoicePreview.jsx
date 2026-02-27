import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("generatedInvoice") || "{}");
    if (stored._id) {
      const token = localStorage.getItem("token");
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${stored._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((inv) => setData(inv))
        .catch(() => setData(stored));
    } else {
      setData(stored);
    }
  }, []);

  if (!data) {
    return (
      <div className="p-10 text-white">
        Loading invoice data...
      </div>
    );
  }

  const localFirm = JSON.parse(localStorage.getItem("selectedFirm") || "{}");
  const firm = (data.firmId && typeof data.firmId === 'object') ? data.firmId : (data.firm || localFirm);
  const items = data.items || [];
  const invoiceNo = data.invoiceNumber || "N/A";
  const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const customerName = data.customerName || "Guest";
  const customerPhone = data.customerPhone || "";
  const customerAddress = data.customerAddress || "";

  const subTotal = data.subTotal || 0;
  const grandTotal = data.grandTotal || 0;
  const taxableAmt = data.taxableAmt || subTotal;
  const cgst = (taxableAmt * 0.015).toFixed(2);
  const sgst = (taxableAmt * 0.015).toFixed(2);
  const received = data.received || 0;
  const balance = (grandTotal - parseFloat(received)).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return '';
    };

    if (num === 0) return "Zero Only/-";
    return inWords(Math.round(num)) + " Only/-";
  };

  return (
    <div className="page-container no-print-bg">
      <div className="content-max-width mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <button
          onClick={() => navigate("/invoice-form")}
          className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </button>
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="btn-primary !py-2 !px-8 text-xs uppercase tracking-widest"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div
        ref={printRef}
        className="invoice-container bg-white text-black p-4 md:p-8 mx-auto print:p-0 print:m-0"
        style={{ width: "210mm", minHeight: "297mm", fontFamily: "serif" }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4">
          <div className="w-32 h-32 flex items-center justify-center">
            <div className="bg-[#555] p-2 relative">
              <div className="border-2 border-white/50 p-2">
                <span className="text-white text-7xl font-serif italic font-black">A</span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black"></div>
            </div>
          </div>

          <div className="flex-1 text-center flex flex-col items-center">
            <h1 className="text-5xl font-black text-gray-800 tracking-tighter mb-0" style={{ fontFamily: 'sans-serif' }}>
              AARAMBH
            </h1>
            <h2 className="text-5xl font-black text-gray-800 tracking-tighter mb-2" style={{ fontFamily: 'sans-serif' }}>
              JEWELS
            </h2>
            <p className="text-xl font-bold tracking-[0.2em] text-gray-700">GOLD AND SILVER</p>
            <p className="text-sm font-bold text-gray-600">STORE KESLA</p>
            <p className="text-sm font-bold text-gray-600 uppercase">Phone : {firm.phone || "8827375018"}</p>
          </div>

          <div className="w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 100 80" className="w-full h-full fill-none stroke-black stroke-[4]">
              <path d="M50 5 L95 75 L5 75 Z" />
              <circle cx="50" cy="50" r="10" fill="black" />
              <rect x="10" y="75" width="80" height="5" fill="black" />
              <text x="50" y="72" textAnchor="middle" fontSize="6" className="fill-black stroke-none font-bold">मानक: पथप्रदर्शक:</text>
            </svg>
          </div>
        </div>

        <div className="flex justify-between mb-4 text-[11px] leading-tight">
          <div className="space-y-1">
            <p className="font-bold underline">Details Of Receiver(Bill To) :</p>
            <p><span className="w-16 inline-block font-bold">NAME</span> : {customerName.toUpperCase()}</p>
            <p><span className="w-16 inline-block font-bold">ADDRESS</span> : {customerAddress.toUpperCase()}</p>
            <p><span className="w-16 inline-block font-bold">PHONE</span> : {customerPhone}</p>
          </div>
          <div className="text-right space-y-1">
            <p><span className="font-bold">INVOICE NO:</span> {invoiceNo}</p>
            <p><span className="font-bold">DATE:</span> {date.toUpperCase()}</p>
            <p><span className="font-bold">GSTIN :</span> {firm.gstNumber || "23EXDPS7162D1ZG"}</p>
          </div>
        </div>

        <div className="bg-gray-200 border-y-2 border-black text-center py-1 font-bold text-[12px] mb-2">
          {data.metalType?.toUpperCase() || "Gold"} SELL
        </div>

        <div className="border-x-2 border-t-2 border-black mb-4">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black font-bold">
                <th className="border-r-2 border-black p-1 w-20">PROD NAME</th>
                <th className="border-r-2 border-black p-1 w-24">H-UID</th>
                <th className="border-r-2 border-black p-1">HSN</th>
                <th className="border-r-2 border-black p-1">GS WT</th>
                <th className="border-r-2 border-black p-1">LESS WT</th>
                <th className="border-r-2 border-black p-1">NT WT</th>
                <th className="border-r-2 border-black p-1">PURITY</th>
                <th className="border-r-2 border-black p-1">RATE</th>
                <th className="border-r-2 border-black p-1 w-16">MKG CHARG</th>
                <th className="border-r-2 border-black p-1">AMOUNT</th>
                <th className="border-r-2 border-black p-1">FINAL MKG</th>
                <th className="border-r-2 border-black p-1">HALLMARK CHARGES</th>
                <th className="p-1">FINAL AMT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b-2 border-black h-8 align-middle">
                  <td className="border-r-2 border-black px-1 text-left">{item.description?.toUpperCase() || item.prodName?.toUpperCase()}</td>
                  <td className="border-r-2 border-black px-1 uppercase font-mono text-[9px]">{item.huid || "-"}</td>
                  <td className="border-r-2 border-black px-1">{item.hsn || "7113"}</td>
                  <td className="border-r-2 border-black px-1">{parseFloat(item.gsWt || item.weight || 0).toFixed(3)} GM</td>
                  <td className="border-r-2 border-black px-1">{item.lessWt || "-"}</td>
                  <td className="border-r-2 border-black px-1">{parseFloat(item.ntWt || item.weight || 0).toFixed(3)} GM</td>
                  <td className="border-r-2 border-black px-1">{item.purity || "84"} %</td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.rate || 0).toFixed(0)}</td>
                  <td className="border-r-2 border-black px-1">
                    {item.mkgCharg || item.makingCharges || 0} GM
                  </td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.amount || (item.ntWt * item.rate) || 0).toFixed(2)}</td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.finalMkg || ((item.ntWt || item.weight || 0) * (item.mkgCharg || 0))).toFixed(1)}</td>
                  <td className="border-r-2 border-black px-1">{item.hallmark || item.hallmarkCharges || 0}</td>
                  <td className="px-1 font-bold font-mono">{parseFloat(item.total || item.finalAmt || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col mb-12">
          <div className="w-full flex justify-between items-start">
            <div className="flex-1 space-y-6">
              <div>
                <p className="font-bold underline text-[11px] mb-1">Terms And Conditions :</p>
                <ul className="text-[9px] list-none space-y-0.5">
                  <li>• Right To Weight Exchange On Gold Vaule</li>
                  <li>• When You Sell Gold The Spot Price Will Be Rupees 20 Less Per Gram</li>
                  <li>• Goods Will Be Returned Only If The Purity Sepecified By Us Is Not Found</li>
                  <li>• 1st Maintenance On Gold Item Above Rupees 12000</li>
                  <li>• Selling Weight Will Be Reduced By Selling Gold</li>
                  <li>• 7 Days Exchange</li>
                </ul>
              </div>

              <div className="flex items-end gap-2 text-[10px] font-bold">
                <span className="whitespace-nowrap">CASH PAY / Cash in Hand / CASH RECEIVED :</span>
                <span className="border-b border-black min-w-[120px] text-center pb-0.5">₹{parseFloat(received).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="w-[320px] text-[11px] font-bold space-y-0.5 border-t border-black pt-1">
              <div className="flex justify-between py-0.5">
                <span>AMOUNT :</span> <span>{(items.reduce((acc, item) => acc + (parseFloat(item.amount || (item.ntWt * item.rate) || 0)), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-0.5 border-t border-black/10">
                <span>TAXABLE AMT :</span> <span>{parseFloat(taxableAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>CGST (1.5%) :</span> <span>{parseFloat(cgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>SGST (1.5%) :</span> <span>{parseFloat(sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-black py-0.5">
                <span>TOTAL AMOUNT :</span> <span>{parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t-2 border-black py-1 bg-gray-50 px-1 items-center">
                <span className="text-sm">NET RECEIVABLE AMT :</span>
                <span className="text-lg font-black">{parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 bg-gray-100 px-1 border-t border-black">
                <span>AMT BALANCE :</span> <span>{parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} DR</span>
              </div>
            </div>
          </div>

          <div className="w-full border-y-[1.5px] border-black py-1 px-2 mt-2 flex items-center text-[11px] font-bold">
            <span className="w-40 whitespace-nowrap">TOTAL AMOUNT :</span>
            <span className="flex-1 text-left italic" style={{ marginLeft: '20px' }}>{numberToWords(grandTotal)}</span>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-auto pt-24 flex justify-between items-center text-[11px] font-bold px-4">
          <div className="border-t border-black pt-1 w-48 text-center uppercase tracking-tighter">
            Customer Signatory
          </div>
          <div className="border-t border-black pt-1 w-48 text-center uppercase tracking-tighter">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
