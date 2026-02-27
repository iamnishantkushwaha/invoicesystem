const Invoice = require("../models/invoiceSchema");
const Firm = require("../models/Firm");

// ===============================
// CREATE INVOICE
// POST /api/invoices
// ===============================
exports.createInvoice = async (req, res) => {
  if (!req.body.invoiceNumber) {
    return res.status(400).json({ message: "invoiceNumber is required" });
  }
  try {
    const {
      firmId,
      invoiceTypeId,
      metalType,
      customerName,
      customerPhone,
      customerAddress,
      customerGstin,
      items,
      received,
    } = req.body;

    // Validate firm belongs to logged-in user
    const firm = await Firm.findOne({
      _id: firmId,
      owner: req.user._id,
    });

    if (!firm) {
      return res.status(403).json({
        message: "Unauthorized firm access",
      });
    }

    const invoice = await Invoice.create({
      firmId,
      userId: req.user._id,
      invoiceTypeId,
      metalType,
      customerName,
      customerPhone,
      customerAddress,
      customerGstin,
      received,
      items,
      subTotal: req.body.subTotal,
      grandTotal: req.body.grandTotal,
      invoiceNumber: req.body.invoiceNumber,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET ALL INVOICES (User Only)
// GET /api/invoices
// ===============================
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      userId: req.user._id,
    })
      .populate("firmId")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE INVOICE
// GET /api/invoices/:id
// ===============================
exports.getSingleInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("firmId");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// UPDATE INVOICE
// PUT /api/invoices/:id
// ===============================
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    Object.assign(invoice, req.body);

    await invoice.save(); // triggers pre-save calculation

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// DELETE INVOICE
// DELETE /api/invoices/:id
// ===============================
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
