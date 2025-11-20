import express from "express";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await connectToDatabase();
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const locations = await Location.find({ user: userId }).populate("user", "name email");

        return res.status(200).json({ success: true, data: locations });
    } catch (error) {
        console.error("locationRoutes error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: String(error) });
    }
});

export default router;
