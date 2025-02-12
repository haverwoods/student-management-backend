const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentcontroller");
const { body } = require("express-validator");

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


// Routes without authentication middleware
router.get("/:id", studentController.getStudentDetails);
router.post("/", studentValidation, studentController.registerStudent);
router.put("/:id", studentController.updateStudentDetails);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;