const express = require("express");
const router = express.Router();
const courseController = require("../controller/coursecontroller");
const { body } = require("express-validator");

// Validation middleware array for course creation and updates
const courseValidation = [
  body("name").not().isEmpty().withMessage("Course name is required"),
  body("grade").isInt().withMessage("Grade must be a number"),
  body("section").not().isEmpty().withMessage("Section is required"),
];

// Routes for courses
router.get("/:id", courseController.getCourseDetails); // Get course details by ID
router.get("/", courseController.getCourseDetails); // Get all courses
router.post("/", courseValidation, courseController.createCourse); // Create a new course
router.put("/:id", courseController.updateCourse); // Update course details
router.delete("/:id", courseController.deleteCourse); // Delete a course

module.exports = router;
