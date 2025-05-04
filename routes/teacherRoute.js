const express = require("express");
const router = express.Router();
const teacherController = require("../controller/teachercontroller");
const { body } = require("express-validator");

// Validation middleware array for teacher
const teacherValidation = [
  body("firstName").not().isEmpty().withMessage("First name is required"),
  body("lastName").not().isEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone")
  .matches(/^(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$|^\d{10,12}$/) // Modified to accept more phone number formats
    .withMessage("Contact phone must contain only numbers, spaces, hyphens, and optionally start with +")
];

// Routes for Teacher
router.get("/:id", teacherController.getTeacherDetails);
router.get("/", teacherController.getTeacherDetails);
router.post("/",  teacherValidation,teacherController.registerTeacher);
router.put("/:id", teacherController.updateTeacherDetails);
router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
