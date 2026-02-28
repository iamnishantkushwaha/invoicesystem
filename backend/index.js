require("dotenv").config();
const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoiceRoutes");
const invoiceTypeRoutes = require("./routes/invoiceTyperoutes"); // adjust path
const { connectdatabase } = require("./dbconnection");

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const { cloudinary, upload } = require("./utils/cloudinary");

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));

// Database & Cloudinary Connection Check
connectdatabase(MONGO_URL);

if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log("Cloudinary configured successfully");
} else {
    console.error("Cloudinary configuration missing in .env");
}



// Routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/firms", require("./routes/firmRoutes"));
app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoice-types", invoiceTypeRoutes);
// Start Server
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
