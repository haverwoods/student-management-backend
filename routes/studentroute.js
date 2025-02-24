
const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentcontroller");
const { body, validationResult } = require("express-validator");
const multer = require("multer");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/JPEG files are allowed"), false);
    }
  }
});
// Validation middleware array
const studentValidation = [
  body("rollNumber").not().isEmpty().withMessage("Roll number is required"),
  body("firstName").not().isEmpty().withMessage("First name is required"),
  body("lastName").not().isEmpty().withMessage("Last name is required"),
  body("dateOfBirth").isDate().withMessage("Valid date of birth is required"),
  body("grade").not().isEmpty().withMessage("Grade is required"),
  body("section").not().isEmpty().withMessage("Section is required"),
  body("contactPhone")
    .matches(/^\+?[\d\s-]+$/)  // Modified to accept more phone number formats
    .withMessage("Contact phone must contain only numbers, spaces, hyphens, and optionally start with +")
];

// // Handle POST requests for creating a student
router.post("/", upload.single("profileImage"), studentValidation, (req, res, next) => {
  // Handle file and validation errors before processing the student registration
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Profile image is required" , details: "Please upload a valid JPG/JPEG file" });
    
  }

  // Proceed with student registration if no errors
  return studentController.registerStudent(req, res, next);
});


// router.post("/", upload.single("profileImage"), (req, res) => {
//   console.log(req.body); // Form fields
//   console.log(req.file); // File info
//   res.json({ message: "Success" });
// });


router.get("/:id", studentController.getStudentDetails);
router.get("/", studentController.getStudentDetails);
router.put("/:id", studentController.updateStudentDetails);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
