import express from "express";
import User from "../models/User.js";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();
router.get("", async (req, res) => {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return res.status(400).json({ message: "User ID are required" });
        }

        const locations = await Location.find({ user: userId }).populate("user", "name email");

        return res.status(200).json(locations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});
export default router;
