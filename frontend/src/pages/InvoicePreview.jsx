import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Eye, CloudUpload } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ThemeToggle from "../components/ThemeToggle";
import { toast } from "react-toastify";
import { apiFetch } from "../utils/api";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [data, setData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error

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

  const hasUploaded = useRef(false);
  useEffect(() => {
    console.log("Auto-Upload Check - _id:", data?._id, "hasUrl:", !!data?.cloudinaryUrl, "hasUploaded:", hasUploaded.current);
    if (data && data._id && !data.cloudinaryUrl && !hasUploaded.current) {
      console.log("All conditions met. Starting 500ms timer...");
      hasUploaded.current = true;
      setTimeout(() => {
        console.log("Timer complete! Invoking uploadToCloudinary...");
        uploadToCloudinary();
      }, 500);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="p-10 text-theme-primary">
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
    toast.info("Returning to Builder...", {
      autoClose: 1500,
      position: "top-center",
      theme: "colored"
    });
    setTimeout(() => {
      navigate("/invoice-form");
    }, 1500);
  };

  const uploadToCloudinary = async () => {
    console.log("uploadToCloudinary invoked.");
    if (!printRef.current) {
      console.warn("printRef.current is NULL. Aborting upload.");
      return;
    }
    console.log("printRef.current is valid. Starting upload flow...");
    setUploadStatus("uploading");
    try {
      const element = printRef.current;
      console.log("Starting PDF generation for element:", element);

      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced from 2.0 to save space
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(".invoice-container");
          if (clonedElement) {
            clonedElement.style.color = "#000000";
            clonedElement.style.backgroundColor = "#ffffff";
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.color.includes("oklab") || style.color.includes("oklch")) el.style.color = "#000000";
              if (style.borderColor.includes("oklab") || style.borderColor.includes("oklch")) el.style.borderColor = "#000000";
              if (style.backgroundColor.includes("oklab") || style.backgroundColor.includes("oklch")) {
                el.style.backgroundColor = "#f3f4f6";
              }
            });
          }
        }
      });

      // Use JPEG with 0.8 quality instead of PNG to drastically reduce file size
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true // Enable internal PDF compression
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], `invoice_${invoiceNo}.pdf`, { type: "application/pdf" });

      // We'll use a signed upload approach or proxy through our backend if needed.
      // For simplicity and security, we'll send it to our backend which handles Cloudinary.
      const formData = new FormData();
      formData.append("file", pdfFile);

      const token = localStorage.getItem("token"); // Still needed for console log or other logic
      console.log("Preparing to fetch:", `${import.meta.env.VITE_API_BASE_URL}/api/invoices/${data._id}/upload`);
      const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${data._id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res && res.ok) {
        const updatedInvoice = await res.json();
        toast.success("Invoice Ready & Saved!", { autoClose: 2000 });
        setData(updatedInvoice);
        setUploadStatus("success");
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        toast.error(`Sync failed: ${errorData.message}`);
        setUploadStatus("error");
      }
    } catch (err) {
      toast.error("Cloud Error: " + err.message);
      setUploadStatus("error");
    }
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
          className="flex items-center gap-2 text-theme-muted hover:text-theme-teal transition-all font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </button>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="btn-primary !py-2 !px-8 text-xs uppercase tracking-widest"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            {/* Live Upload Status Indicator */}
            <div className="flex items-center gap-3">
              {uploadStatus === "uploading" && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Uploading to Cloud...</span>
                </div>
              )}

              {((uploadStatus === "success" || uploadStatus === "idle") && data?.cloudinaryUrl) && (
                <div className="flex items-center gap-2">
                  <a
                    href={data.cloudinaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 transition-all text-xs font-bold uppercase tracking-wider hover:bg-green-500/30 group shadow-lg shadow-green-500/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Uploaded
                    <Eye className="w-4 h-4 ml-1 group-hover:scale-110 transition-transform" />
                  </a>
                  <button
                    onClick={() => {
                      hasUploaded.current = false;
                      uploadToCloudinary();
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-theme-muted hover:text-theme-teal transition-all hover:bg-white/10"
                    title="Re-upload PDF"
                  >
                    <CloudUpload className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-nowrap">Upload Fail</span>
                  </div>
                  <button
                    onClick={() => {
                      hasUploaded.current = false;
                      uploadToCloudinary();
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-theme-muted hover:text-theme-teal transition-all hover:bg-white/10"
                    title="Retry Upload"
                  >
                    <CloudUpload className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
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
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-2 uppercase" style={{ fontFamily: 'sans-serif' }}>
              {firm.name || "AARAMBH JEWELS"}
            </h1>
            <p className="text-xl font-bold tracking-[0.2em] text-gray-700 mb-1">GOLD AND SILVER</p>
            <p className="text-sm font-bold text-gray-600 uppercase">{firm.address || "STORE KESLA"}</p>
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
                <tr key={idx} className="border-b-2 border-black h-12 align-middle">
                  <td className="border-r-2 border-black px-1 text-left font-bold">{item.description?.toUpperCase() || item.prodName?.toUpperCase()}</td>
                  <td className="border-r-2 border-black px-1 uppercase font-mono text-[9px] leading-tight">{item.huid || "-"}</td>
                  <td className="border-r-2 border-black px-1">{item.hsn || "7113"}</td>
                  <td className="border-r-2 border-black px-1">
                    <div>{parseFloat(item.gsWt || 0).toFixed(3)}</div>
                    <div className="text-[8px] font-bold">GM</div>
                  </td>
                  <td className="border-r-2 border-black px-1">{item.lessWt || "-"}</td>
                  <td className="border-r-2 border-black px-1">
                    <div>{parseFloat(item.ntWt || 0).toFixed(3)}</div>
                    <div className="text-[8px] font-bold">GM</div>
                  </td>
                  <td className="border-r-2 border-black px-1">{item.purity || "84"} %</td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.rate || 0).toLocaleString()}</td>
                  <td className="border-r-2 border-black px-1">
                    <div>{item.makingCharges || item.mkgCharg || 0}</div>
                    <div className="text-[8px] font-bold">GM</div>
                  </td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.basicAmt || (item.ntWt * item.rate / 10) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="border-r-2 border-black px-1 font-mono">{parseFloat(item.finalMkg || ((item.ntWt || 0) * (item.makingCharges || 0))).toFixed(1)}</td>
                  <td className="border-r-2 border-black px-1">{item.hallmarkCharges || item.hallmark || 0}</td>
                  <td className="px-1 font-bold font-mono">{parseFloat(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
