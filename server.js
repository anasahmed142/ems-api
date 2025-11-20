
import 'dotenv/config';
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/auth.js";
import locationRoutes from "./routes/locationRoutes.js";
import locationHistoryRoutes from "./routes/locationHistory.js";
import payroll from "./routes/payroll.js";
import trackRoutes from "./routes/trackLocation.js";

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;
// Configure CORS to allow the frontend origin and enable credentials
const FRONTEND_URL = 'https://employe-managment-system-peach.vercel.app';
const corsOptions = {
	origin: function (origin, callback) {
		// allow requests with no origin like mobile apps or curl
		if (!origin) return callback(null, true);
		if (origin === FRONTEND_URL) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions));
// Increase body size limits to handle larger JSON / form payloads
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/location-history", locationHistoryRoutes);
app.use("/api/payroll", payroll);
app.use("/api/track-location", trackRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
