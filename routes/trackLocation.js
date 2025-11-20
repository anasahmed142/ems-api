import express from "express";
import User from "../models/User.js";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();
router.post("", async (request, res) => {
    try {
        const payload = await req.body;
        const { userId, location } = payload;

        if (!userId || !location) {
            return res.status(400).json({ success: false, message: "userId and location are required" });
        }

        await connectToDatabase();

        const newLocation = new Location({
            user: userId,
            LocationTypes: "Regular",
            location: location,
        });
        console.log("newLocation:", newLocation);
        const id = await newLocation.save();
        console.log("Login saved:", id);

        await newLocation.save();
        return res.status(200).json({ success: true, message: "Location tracked successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error, message: "Internal Server Error" });
    }
});
export default router;
