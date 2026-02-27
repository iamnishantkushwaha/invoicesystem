// routes/invoiceType.js
const express = require("express");
const router = express.Router();
const InvoiceType = require("../models/invoicetype"); // adjust path if needed

// GET all invoice types
router.get("/", async (req, res) => {
  try {
    const types = await InvoiceType.find(); // fetch all types
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;