// const { PrismaClient } = require("@prisma/client");
// const multer = require("multer");
// const { validationResult } = require("express-validator");
// const { createClient } = require('@supabase/supabase-js');

// const prisma = new PrismaClient();

// // Initialize Supabase client
// const supabaseUrl = 'YOUR_SUPABASE_URL'; // replace with your Supabase URL
// const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // replace with your Supabase anon key
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Set up multer to handle the file upload (stored in memory)
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });


// // Register a new student
// exports.registerStudent = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { rollNumber, firstName, lastName, dateOfBirth, grade, section, contactPhone, createdAt } = req.body;

//     // Check if the student already exists
//     const existingStudent = await prisma.student.findUnique({
//       where: { rollNumber },
//     });

//     if (existingStudent) {
//       return res.status(400).json({ message: "Student with this roll number already exists" });
//     }

//     // Handle the profile picture if it's provided in the request
//     let profilePictureUrl = null;

//     // Check if there's a file in the request (make sure you handle this in the frontend)
//     if (req.file) {
//       const file = req.file;
//       const fileName = `${Date.now()}_${file.originalname}`;

//       // Upload to Supabase storage
//       const { error: uploadError } = await supabase
//         .storage
//         .from('student image')  // Assuming the bucket name is 'student image'
//         .upload(fileName, file.buffer, { contentType: file.mimetype });

//       if (uploadError) {
//         throw new Error("Error uploading image to Supabase: " + uploadError.message);
//       }

//       // Get the public URL of the uploaded file
//       const { publicURL, error: urlError } = supabase
//         .storage
//         .from('student image')
//         .getPublicUrl(fileName);

//       if (urlError) {
//         throw new Error("Error fetching URL from Supabase: " + urlError.message);
//       }

//       profilePictureUrl = publicURL;  // Store the public URL
//     }

//     // Create new student record
//     const newStudent = await prisma.student.create({
//       data: {
//         rollNumber,
//         firstName,
//         lastName,
//         dateOfBirth: new Date(dateOfBirth), // Ensuring proper date format
//         grade: parseInt(grade, 10),
//         section,
//         contactPhone,
//         createdAt: createdAt ? new Date(createdAt) : undefined,
//         profilePicture: profilePictureUrl,  // Store the URL of the profile picture
//       },
//     });

//     res.status(201).json({
//       message: "Student registered successfully",
//       student: newStudent,
//     });
//   } catch (error) {
//     console.error("Error registering student:", error.message, error.stack);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Multer middleware to handle file uploads before the controller
// exports.uploadProfilePicture = upload.single('profilePicture'); // Use 'profilePicture' for the file key in frontend
