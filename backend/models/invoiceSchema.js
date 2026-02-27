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
    unique: true,
    required: true
  }

}, { timestamps: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;