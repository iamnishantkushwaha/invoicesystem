const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  uploadInvoicePDF,
  updateCloudinaryUrl,
  getLastInvoiceNumber,
  redirectCloudinary
} = require("../controllers/invoiceController");
const { upload } = require("../utils/cloudinary");

// ==============================
// CREATE INVOICE
// POST /api/invoices
// ==============================
router.post("/", protect, createInvoice);

// ==============================
// GET ALL INVOICES (Logged-in user)
// GET /api/invoices
// ==============================
router.get("/", protect, getInvoices);

// ==============================
// GET LAST INVOICE NUMBER
// GET /api/invoices/last-number
// ==============================
router.get("/last-number", protect, getLastInvoiceNumber);

// ==============================
// GET INVOICE STATS
// GET /api/invoices/stats
// ==============================
router.get("/stats", protect, getInvoiceStats);

// ==============================
// GET SINGLE INVOICE BY ID
// GET /api/invoices/:id
// ==============================
router.get("/:id", protect, getSingleInvoice);

// ==============================
// UPDATE INVOICE
// PUT /api/invoices/:id
// ==============================
router.put("/:id", protect, updateInvoice);

// ==============================
// DELETE INVOICE
// DELETE /api/invoices/:id
// ==============================
router.delete("/:id", protect, deleteInvoice);

// ==============================
// UPDATE CLOUDINARY INFO
// PATCH /api/invoices/:id/cloudinary
// ==============================
router.patch("/:id/cloudinary", protect, updateCloudinaryUrl);

// UPLOAD PDF TO CLOUDINARY
// POST - For actual upload | GET - For redirect to Cloudinary
// ==============================
router.post("/:id/upload", protect, upload.single("file"), uploadInvoicePDF);
router.get("/:id/upload", protect, redirectCloudinary);

module.exports = router;