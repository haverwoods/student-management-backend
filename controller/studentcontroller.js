const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Register a new student
exports.registerStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rollNumber, firstName, lastName, dateOfBirth, grade, section, contactPhone , createdAt } = req.body;

    // Check if the student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber },
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student with this roll number already exists" });
    }

    // Create new student record
    const newStudent = await prisma.student.create({
      data: {
        rollNumber,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth), // Ensuring proper date format
        grade: parseInt(grade, 10),
        section,
        contactPhone,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    res.status(201).json({
      message: "Student registered successfully",
      student: newStudent,
    });
} catch (error) {
    console.error("Error registering student:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
  
};

// Get student details
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Fetch specific student by ID
      const student = await prisma.student.findUnique({
        where: { id: parseInt(id) },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json(student);
    } else {
      // Fetch all students
      const students = await prisma.student.findMany();
      res.status(200).json(students);
    }
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update student details
exports.updateStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNumber, firstName, lastName, dateOfBirth, grade, section, contactPhone } = req.body;

    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        rollNumber,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, // Update only if provided
        grade,
        section,
        contactPhone
      },
    });

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete student record
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    await prisma.student.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
};
