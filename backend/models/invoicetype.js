const mongoose = require("mongoose");

const InvoiceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  }
},{ timestamps: true });

const InvoiceType = mongoose.model("InvoiceType", InvoiceTypeSchema);
module.exports = InvoiceType;