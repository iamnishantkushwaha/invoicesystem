const Firm = require("../models/Firm");

// Create New Firm
exports.createFirm = async (req, res) => {
  try {
    const { name, address, gstNumber } = req.body;

    const firm = await Firm.create({
      name,
      address,
      gstNumber,
      owner: req.user, // from token
      createdAt: new Date(),
    });

    res.status(201).json(firm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Firms of Logged In User
exports.getFirms = async (req, res) => {
  try {
    const firms = await Firm.find({ owner: req.user });

    res.json(firms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};