require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const { connectdatabase } = require("./dbconnection");

const seedAdmin = async () => {
    const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/InvoiceSystem";

    try {
        await connectdatabase(MONGO_URL);
        console.log("Connected to database for seeding...");

        const adminEmail = "admin@example.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists. Skipping seeding.");
        } else {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const adminUser = new User({
                name: "Administrator",
                email: adminEmail,
                password: hashedPassword,
                phone: 9876543210
            });

            await adminUser.save();
            console.log("Admin user seeded successfully!");
            console.log("Email: admin@example.com");
            console.log("Password: admin123");
        }
    } catch (error) {
        console.error("Error seeding admin user:", error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedAdmin();
