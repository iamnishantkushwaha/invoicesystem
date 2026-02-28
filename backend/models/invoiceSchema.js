const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Firm",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  invoiceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InvoiceType",
    required: true,
  },
  metalType: {
    type: String,
    enum: ["gold", "silver", "both"],
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: String,
  customerAddress: String,
  customerGstin: String,

  items: [
    {
      description: String,
      huid: String,
      hsn: String,
      gsWt: Number,
      lessWt: Number,
      ntWt: Number,
      purity: String,
      metal: {
        type: String,
        enum: ["gold", "silver", "both"],
      },
      weight: Number,
      rate: Number,
      makingCharges: Number,
      hallmarkCharges: Number,
      basicAmt: Number,
      finalMkg: Number,
      gstPercent: Number,
      total: Number,
    }
  ],

  subTotal: Number,
  grandTotal: Number,
  received: {
    type: Number,
    default: 0
  },

  invoiceNumber: {
    type: String,
    required: true
  },
  cloudinaryUrl: String,
  cloudinaryPublicId: String

}, { timestamps: true });

// Compound index for uniqueness per user
InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;