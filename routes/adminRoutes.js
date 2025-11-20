import express from "express";
import User from "../models/User.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();
router.post("/addemployee", async (req, res) => {
    try {
        const { name, salery, email, adminEmail } = req.body || {};
        await connectToDatabase();

        // Check if the user making the request is an admin
        const admin = await User.findOne({ email: adminEmail });
        if (!admin || admin.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user (password will be hashed by schema pre-save)
        const newUser = new User({ name, email, salery, password: "password" });
        await newUser.save();

        return res.status(201).json({ message: "Employee added successfully" });
    } catch (error) {
        console.error("Error adding employee:", error);
        return res.status(500).json({ message: "Internal server error", error: String(error) });
    }
});
router.post("/deleteuser", async (req, res) => {
    try {
        const { userId } = req.body || {};

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        await connectToDatabase();
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: String(error) });
    }
});
router.post("/getuser", async (req, res) => {
    try {
        const { userId } = req.body || {};

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        await connectToDatabase();
        const user = await User.findById(userId).select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User retrieved successfully.", data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: String(error) });
    }
});
router.post("/updateuser", async (req, res) => {
    try {
        const { userId, ...updateData } = req.body || {};

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        await connectToDatabase();
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User updated successfully.", data: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: String(error) });
    }
});
router.post("/alluser", async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        await connectToDatabase();
        const adminUser = await User.findOne({ email }).select("role");
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(401).json({ success: false, message: "Not Authorized, only admin can access this" });
        }

        // Fetch all users except password and refreshToken
        const allUsers = await User.find().select("-password -refreshToken");

        if (!allUsers || allUsers.length === 0) {
            return res.status(404).json({ success: false, message: "No users found." });
        }

        return res.status(200).json({ success: true, message: "All users retrieved successfully.", data: allUsers });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: String(error) });
    }
});
export default router;
