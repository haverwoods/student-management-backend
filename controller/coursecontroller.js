const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Create a new course
exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, grade, section, teacherId, startDay, endDay, startTime, endTime } = req.body;

    // If teacherId is a name (e.g., "kim"), find the teacher ID first
    let finalTeacherId = teacherId;
    if (isNaN(teacherId)) { // If it's a name, not a number
      const teacher = await prisma.teacher.findFirst({
        where: { firstName: teacherId }, // Or use firstName, lastName, etc.
      });
      if (!teacher) {
        return res.status(400).json({ message: "Teacher not found by name" });
      }
      finalTeacherId = teacher.id; // Use the teacher's ID from the database
    }

        // Validate that all required fields are present
        if (!name || !section || !startDay || !endDay || !startTime || !endTime) {
          return res.status(400).json({ message: "All fields are required: name, grade, section, startDay, endDay, startTime, endTime" });
        }

    // Check if the course already exists for the same grade and section

    const existingCourse = await prisma.course.findFirst({
      where: {
        AND: [
          { name },
          { grade: parseInt(grade, 10) }, // Ensure grade is properly casted to an integer
          { section },
        ],
      },
    });
    
    if (existingCourse) {
      return res.status(400).json({
        message: "Course already exists with the same name, grade, and section",
      });
    }

    // Create new course record
    const newCourse = await prisma.course.create({
      data: {
        name,
        grade: parseInt(grade, 10),
        section,
        teacherId: finalTeacherId,
        startDay,
        endDay,
        startTime,
        endTime,
      },
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Fetch specific course by ID
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          enrollments: true,
          attendances: true,
        },
      });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(course);
    } else {
      // Fetch all courses
      const courses = await prisma.course.findMany({ 
        include: {
          enrollments: true,
          attendances: true,
        },
      });
      res.status(200).json(courses);
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update course details
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, section } = req.body;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        name,
        grade: grade ? parseInt(grade, 10) : undefined,
        section,
      },
    });

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete course record
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error" });
  }
};
