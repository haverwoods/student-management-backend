const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authroute.js");
const studentRoutes = require("./routes/studentroute.js");
const courseRoutes = require("./routes/courseroute.js");
const teacherRoutes = require("./routes/teacherRoute.js");
const notificationRoutes = require("./routes/notificationroute.js");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teacher", teacherRoutes);
// app.use("/api/notifications", notificationRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
