require("dotenv").config();
const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoiceRoutes");
const invoiceTypeRoutes = require("./routes/invoiceTyperoutes"); // adjust path
const { connectdatabase } = require("./dbconnection");

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database Connection
connectdatabase(MONGO_URL);



// Routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/firms", require("./routes/firmRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/invoice-types", require("./routes/invoiceTyperoutes"));
app.use("/api/invoices", invoiceRoutes);
app.use("/invoice-types", invoiceTypeRoutes);
// Start Server
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
