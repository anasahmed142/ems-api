// import express from "express";
// import User from "../models/User.js";
// import Location from "../models/Location.js";
// import { connectToDatabase } from "../lib/db.js";

// const router = express.Router();

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password, location, photo } = req.body;

//     if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

//     await connectToDatabase();

//     const user = await User.findOne({ email });
//     if (!user) return res.status(409).json({ success: false, message: "Invalid email" });

//     const passwordValid = await user.comparePassword(password);
//     if (!passwordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

//     // Save location
//     if (location) {
//       await Location.create({
//         user: user._id,
//         LocationTypes: "Login",
//         location: { ...location, photo },
//       });
//     }

//     // Update status
//     user.status = "online";
//     await user.save();

//     const token = user.generateAccessToken();

//     res.json({
//       success: true,
//       loggedInUser: {
//         userId: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         status: user.status,
//         role: user.role,
//         accessToken: token,
//       },
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error", error });
//   }
// });
// router.post("/logout", async (req, res) => {
//   try {
//       const body = await req.body;
  
//       if (!body) {
//         return NextResponse.json(
//           { message: " input is required for logout." },
//           { status: 400 }
//         );
//       }
  
//       const { email, location, photo } = body;
  
//       if (!email) {
//         return NextResponse.json(
//           { message: "Email is required for logout." },
//           { status: 400 }
//         );
//       }
  
//       await connectionToDatabase();
  
//       // Update user status to offline
//       const user = await User.findOneAndUpdate(
//         { email },
//         { status: "offline" },
//         { new: true }
//       );
  
//       if (!user) {
//         return NextResponse.json({ message: "User not found." }, { status: 404 });
//       }
//       // if (user.role !== "admin") {
//       if (location && photo) {
//         location.photo = photo;
//         const newLocation = new Location({
//           user: user._id,
//           LocationTypes: "Logout",
//           location: location,
//           photo
//         });
//         console.log("newLocation:",newLocation);
//         const id = await newLocation.save();
//         console.log("Logout saved:",id);
//       }
//       // }
  
//       const cookieStore = await cookies();
//       cookieStore.delete("accessToken");
  
//       return NextResponse.json(
//         { message: `Logout successful for ` },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//       return NextResponse.json(
//         { message: `Internal server error${error}` },
//         { status: 500 }
//       );
//     }
// });
// router.post("/register", async (req, res) => {
//   try {
//       const { name, email, password , role = "employee"} = await req.body;
  
//       if (!name || !email || !password) {
//         return response(null, 400, "Email and password are required.");
//       }
  
//       connectionToDatabase();
  
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return response(null, 409, "User already exists.");
//       }
  
//       const newUser = new User({
//          name,
//         email,
//         password,
//         role,
  
//       });
  
//       const user = await User.create(newUser);
  
//       const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken "
//       );
  
//       if (!createdUser) {
//         return response(null, 500, "User registration failed.");
//       }
  
//       return response(
//         createdUser,
//         201,
//         "Signup successful! Check your email to verify."
//       );
//     } catch (error) {
//      const err = error as Error;
//       return response(null, 500, "Internal Server Error", err.message);
//     }
// });
// export default router;
import express from "express";
import User from "../models/User.js";
import Location from "../models/Location.js";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, location, photo } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email & password required" });

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "Invalid email" });

    const valid = await user.comparePassword(password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Wrong password" });

    if (location) {
      await Location.create({
        user: user._id,
        LocationTypes: "Login",
        location: { ...location, photo },
      });
    }

    user.status = "online";
    await user.save();

    const token = user.generateAccessToken();

    return res.json({
      success: true,
      loggedInUser: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        accessToken: token,
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const { email, location, photo } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required for logout" });

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { email },
      { status: "offline" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (location) {
      await Location.create({
        user: user._id,
        LocationTypes: "Logout",
        location: { ...location, photo },
      });
    }

    return res.json({ success: true, message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "employee" } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    await connectToDatabase();

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    return res.json({
      success: true,
      user: { id: user._id, name, email, role },
      message: "Registration successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
