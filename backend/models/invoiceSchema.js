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

  items: [
    {
      description: String,
      metal: {
        type: String,
        enum: ["gold", "silver"],
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

  invoiceNumber: {
    type: String,
    unique: true,
  }

}, { timestamps: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;