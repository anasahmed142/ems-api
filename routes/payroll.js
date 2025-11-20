// import express from "express";
// import { connectionToDatabase } from "../lib/db";
// import User, { IUser } from "../models/User_model";
// import Location, { ILocation } from "../models/Location_model";

// // Define a type for the attendance object
// interface Attendance {
//   [key: string]: {
//     login: Date | null;
//     logout: Date | null;
//   };
// }

// const router = express.Router();
// router.post("", async (req, res) => {
//     try {
//         await connectToDatabase();

//         const allUsers: IUser[] = await User.find().select("-password -refreshToken");

//         const payrollData = [];

//         for (const user of allUsers) {
//             const locations: ILocation[] = await Location.find({ user: user._id }).sort({ createdAt: 1 });

//             const attendance: Attendance = {};

//             for (const loc of locations) {
//                 const date = new Date(loc.createdAt).toDateString();
//                 if (!attendance[date]) {
//                     attendance[date] = { login: null, logout: null };
//                 }
//                 if (loc.LocationTypes === 'login') {
//                     attendance[date].login = loc.createdAt;
//                 } else if (loc.LocationTypes === 'logout') {
//                     attendance[date].logout = loc.createdAt;
//                 }
//             }

//             let daysWorked = 0;
//             for (const date in attendance) {
//                 if (attendance[date].login && attendance[date].logout) {
//                     daysWorked++;
//                 }
//             }

//             // Safely parse salary to a number, defaulting to 0
//             const dailySalary = user.salery ? parseFloat(user.salery) : 0;
//             const salary = daysWorked * dailySalary;

//             payrollData.push({
//                 userId: user._id,
//                 name: user.name,
//                 daysWorked,
//                 salery: user.salery || '0', // Provide a fallback for display
//                 totalSalary: salary,
//             });
//         }

//         return NextResponse.json(
//             { success: true, data: payrollData },
//             { status: 200 }
//         );
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Unknown error";
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: errorMessage },
//             { status: 500 }
//         );
//     }
// });

import express from "express";
import { connectToDatabase } from "../lib/db.js";
import User from "../models/User.js";
import Location from "../models/Location.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectToDatabase();

    const users = await User.find().select("-password -refreshToken");
    const payrollData = [];

    for (const user of users) {
      const locations = await Location.find({ user: user._id }).sort({ createdAt: 1 });

      const attendance = {};

      for (const loc of locations) {
        const date = loc.createdAt.toDateString();

        if (!attendance[date]) {
          attendance[date] = { login: null, logout: null };
        }

        if (loc.LocationTypes === "login") {
          attendance[date].login = loc.createdAt;
        } else if (loc.LocationTypes === "logout") {
          attendance[date].logout = loc.createdAt;
        }
      }

      let daysWorked = 0;
      for (const date in attendance) {
        if (attendance[date].login && attendance[date].logout) {
          daysWorked++;
        }
      }

      const dailySalary = parseFloat(user.salery || "0");
      const totalSalary = dailySalary * daysWorked;

      payrollData.push({
        userId: user._id,
        name: user.name,
        daysWorked,
        salery: user.salery || "0",
        totalSalary,
      });
    }

    return res.status(200).json({
      success: true,
      data: payrollData,
    });

  } catch (error) {
    console.error("Payroll error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router;
