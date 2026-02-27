const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

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

module.exports = router;