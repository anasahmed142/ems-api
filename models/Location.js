import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  LocationTypes: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    photo: { type: String },
  },
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model("Location", LocationSchema);
