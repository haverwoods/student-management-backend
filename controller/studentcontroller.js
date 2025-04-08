const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const { decode } = require("base64-arraybuffer"); // Change import to require

// Initialize Prisma and Supabase clients
const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials are not properly configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
// Multer configuration
const storage = multer.memoryStorage(); // Define storage before using it

// multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Only allow jpg/jpeg
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/JPEG files are allowed"), false);
    }
  },
}).single("profileImage");

// Middleware for file upload
const handleFileUpload = async (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.message);
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    } else if (err) {
      console.error("Unknown upload error:", err.message);
      return res
        .status(500)
        .json({ message: "Unknown error", error: err.message });
    }
    next();
  });
};
//regester new students
exports.registerStudent = async (req, res) => {
  console.log("Request received with body:", req.body);

  try {
    // Validate required fields
    const requiredFields = [
      "rollNumber",
      "firstName",
      "lastName",
      "dateOfBirth",
      "grade",
      "section",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        fields: missingFields,
      });
    }

    // Validate date format
    const dateOfBirth = new Date(req.body.dateOfBirth);
    if (isNaN(dateOfBirth)) {
      return res
        .status(400)
        .json({ message: "Invalid date format for dateOfBirth" });
    }

    // Check if student with the same roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber: req.body.rollNumber },
    });

    if (existingStudent) {
      return res
        .status(409)
        .json({ message: "Student with this roll number already exists" });
    }

    let profileImageUrl = null;

    try {
      const file = req.file;
      if (!file) {
        throw new Error("Please upload a file");
      }

      const originalName = file.originalname;
      const fileName = originalName.toLowerCase(); // Convert to lowercase
      const fullPath = `profile-images/${fileName}`;

      // Debug log
      console.log("Attempting upload:", {
        bucketName: "studentprofile",
        originalName,

        fullPath,
        fileSize: file.buffer.length,
        mimeType: file.mimetype,
      });

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from("studentprofile")
        .upload(fullPath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      // Get public URL directly after upload
      const { data: urlData } = supabase.storage
        .from("studentprofile")
        .getPublicUrl(fullPath);

      profileImageUrl = urlData.publicUrl;
      console.log("Upload successful. URL:", profileImageUrl);
    } catch (error) {
      console.error("Upload process failed:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }

    // Add a small delay before verification (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const studentData = {
      rollNumber: req.body.rollNumber,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: dateOfBirth,
      grade: parseInt(req.body.grade, 10),
      section: req.body.section,

      contactPhone: req.body.contactPhone || null,
      profileImage: profileImageUrl,
    };

    console.log("Creating student record in Prisma...");
    const newStudent = await prisma.student.create({
      data: studentData,
    });

    console.log("Student registered successfully:", newStudent);
    res.status(201).json({
      message: "Student registered successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    if (error.code) {
      return res.status(400).json({
        message: "Database error",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Registration failed",
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
};

//module.exports = { handleFileUpload, registerStudent };

// Get student details
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      const students = await prisma.student.findMany();
      return res.status(200).json(students);
    }

    const studentId = parseInt(id);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update student details
exports.updateStudentDetails = [
  handleFileUpload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = parseInt(id);

      if (isNaN(studentId)) {
        return res.status(400).json({ message: "Invalid student ID format" });
      }

      const existingStudent = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      const updateData = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
        grade: req.body.grade ? parseInt(req.body.grade, 10) : undefined,
      };

      // Handle file upload if present
            const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: updateData,
      });

      res.status(200).json({
        message: "Student updated successfully",
        student: updatedStudent,
      });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
];

// Delete student record
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete profile image from Supabase if it exists
    if (existingStudent.profileImage) {
      try {
        const fileName = existingStudent.profileImage.split("/").pop();
        await supabase.storage
          .from("student-images")
          .remove([`profile-images/${fileName}`]);
      } catch (error) {
        console.error("Error deleting profile image:", error);
      }
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
