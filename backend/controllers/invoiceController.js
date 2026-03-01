const Invoice = require("../models/invoiceSchema");
const Firm = require("../models/Firm");
const { cloudinary } = require("../utils/cloudinary");

// ===============================
// CREATE INVOICE
// POST /api/invoices
// ===============================
exports.getLastInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    if (!lastInvoice) {
      return res.json({ lastNumber: "IS/0" });
    }

    res.json({ lastNumber: lastInvoice.invoiceNumber || "IS/0" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Invoice number already exists for this firm. Please use a different number.",
      });
    }
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
      .populate("invoiceTypeId")
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
    }).populate("firmId").populate("invoiceTypeId");

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

    // Delete from Cloudinary if exists
    if (invoice.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(invoice.cloudinaryPublicId);
        console.log("Cloudinary asset deleted:", invoice.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete Cloudinary asset:", cloudinaryError);
      }
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

// ===============================
// GET INVOICE STATS
// GET /api/invoices/stats
// ===============================
exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// UPDATE CLOUDINARY URL
// PATCH /api/invoices/:id/cloudinary
// ===============================
exports.updateCloudinaryUrl = async (req, res) => {
  try {
    const { cloudinaryUrl, cloudinaryPublicId } = req.body;
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { cloudinaryUrl, cloudinaryPublicId },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ===============================
// UPLOAD INVOICE PDF TO CLOUDINARY
// POST /api/invoices/:id/upload
// ===============================
exports.uploadInvoicePDF = async (req, res) => {
  try {
    console.log("Manual upload request received for invoice:", req.params.id);
    if (!req.file) {
      console.error("No file found in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log(`Received file for upload: ${req.file.originalname}, size: ${req.file.size} bytes`);

    console.log(`Streaming ${req.file.buffer.length} bytes to Cloudinary...`);

    // Manual upload to Cloudinary using stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "invoices",
          resource_type: "raw", // Fixed: Use raw for PDF to avoid "image" corruption
          public_id: `invoice_${Date.now()}.pdf`
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    console.log("File manual-uploaded to Cloudinary. URL:", result.secure_url);
    const { secure_url: cloudinaryUrl, public_id: cloudinaryPublicId } = result;

    console.log("Updating database for invoice ID:", req.params.id, "and user ID:", req.user._id);
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { cloudinaryUrl, cloudinaryPublicId },
      { new: true }
    );

    if (!invoice) {
      console.error("Invoice not found or unauthorized for update. ID:", req.params.id);
      return res.status(404).json({ message: "Invoice not found or unauthorized" });
    }

    console.log("Database updated successfully for invoice:", invoice.invoiceNumber);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// REDIRECT TO CLOUDINARY PDF
// GET /api/invoices/:id/upload
// ===============================
exports.redirectCloudinary = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice || !invoice.cloudinaryUrl) {
      return res.status(404).send("PDF not found or not uploaded yet.");
    }
    res.redirect(invoice.cloudinaryUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
