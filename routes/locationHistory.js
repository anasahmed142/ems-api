import express from "express";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    // Pagination (sanitize inputs)
    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10) || 10));
    const skip = (page - 1) * limit;

    const totalRecords = await Location.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const locations = await Location.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "_id name");

    // Format response with guards
    const formatted = locations.map((loc) => {
      const createdAt = loc.createdAt ? new Date(loc.createdAt) : new Date();
      const locObj = loc.location || {};
      return {
        uid: loc.user?._id?.toString() || "",
        name: loc.user?.name || "",
        timestamp: createdAt.toISOString(),
        latitude: locObj.latitude ?? null,
        longitude: locObj.longitude ?? null,
        accuracy: locObj.accuracy ?? null,
        type: (loc.LocationTypes || "").toString(),
        photo: locObj.photo || "",
      };
    });

    return res.status(200).json({ success: true, data: { locations: formatted, totalPages, currentPage: page } });

  } catch (error) {
    console.error("Location history error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
