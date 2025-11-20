import express from "express";
import Location from "../models/Location.js";
import User from "../models/User.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    // Pagination
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    const totalRecords = await Location.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    const locations = await Location.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "_id name");

    // Format response
    const formatted = locations.map((loc) => ({
      uid: loc.user?._id?.toString() || "",
      name: loc.user?.name || "",
      timestamp: loc.createdAt.toISOString(),
      latitude: loc.location?.latitude,
      longitude: loc.location?.longitude,
      accuracy: loc.location?.accuracy,
      type: loc.LocationTypes,
      photo: loc.location?.photo || "",
    }));

    return res.status(200).json({
      locations: formatted,
      totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error("Location history error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
