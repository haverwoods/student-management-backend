
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const authRoutes = require("./routes/authroute.js");
const studentRoutes = require("./routes/studentroute.js");
const courseRoutes = require("./routes/courseroute.js");
const teacherRoutes = require("./routes/teacherRoute.js");
const notificationRoutes = require("./routes/notificationroute.js");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json()); // parse JSON body


// Configure CORS first
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teacher", teacherRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));