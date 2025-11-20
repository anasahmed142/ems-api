import express from "express";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { userId, location } = req.body || {};

        if (!userId || !location) {
            return res.status(400).json({ success: false, message: "userId and location are required" });
        }

        await connectToDatabase();

        const newLocation = new Location({
            user: userId,
            LocationTypes: "Regular",
            location,
        });

        const saved = await newLocation.save();

        return res.status(201).json({ success: true, message: "Location tracked successfully", data: { id: saved._id } });
    } catch (error) {
        console.error("trackLocation error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: String(error) });
    }
});

export default router;
