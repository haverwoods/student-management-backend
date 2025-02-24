// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const multer = require("multer");
// const authRoutes = require("./routes/authroute.js");
// const studentRoutes = require("./routes/studentroute.js");
// const courseRoutes = require("./routes/courseroute.js");
// const teacherRoutes = require("./routes/teacherRoute.js");
// const notificationRoutes = require("./routes/notificationroute.js");

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Increase the JSON payload size limit
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

// // Middleware
// app.use(cors()); // Enable CORS
// // app.use(express.json()); // Parse JSON requests
// // const upload = multer();
// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/teacher", teacherRoutes);
// // app.use("/api/notifications", notificationRoutes);


// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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

// Configure CORS first
app.use(cors());

// Configure multer for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// }).single('profileImage');

// Middleware to handle multipart/form-data requests
// app.use((req, res, next) => {
//   if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
//     upload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ message: "File upload error", error: err.message });
//       } else if (err) {
//         return res.status(500).json({ message: "Unknown error", error: err.message });
//       }
//       next();
//     });
//   } else {
//     next();
//   }
// });

// Configure body parsers after multer
// app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Error handling middleware
// app.use((err, req, res, next) => {
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     return res.status(400).json({ message: "Invalid request format", error: err.message });
//   }
//   next(err);
// });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teacher", teacherRoutes);
// app.use("/api/notifications", notificationRoutes);

// Generic error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!", error: err.message });
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));