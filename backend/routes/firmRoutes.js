const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createFirm, getFirms } = require("../controllers/firmController");

router.post("/", protect, createFirm);
router.get("/", protect, getFirms);

module.exports = router;