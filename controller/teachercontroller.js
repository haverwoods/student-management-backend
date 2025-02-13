const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Register a new teacher
// exports.registerTeacher = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { firstName, lastName, email, phone, courseIds } = req.body;

//     // Check if the teacher already exists by email
//     const existingTeacher = await prisma.teacher.findUnique({
//       where: { email },
//     });

//     if (existingTeacher) {
//       return res.status(400).json({ message: "Teacher with this email already exists" });
//     }

//     // Create new teacher record
//     const newTeacher = await prisma.teacher.create({
//       data: {
//         firstName,
//         lastName,
//         email,
//         phone,
//         courses: {
//           connect: courseIds ? courseIds.map(courseId => ({ id: courseId })) : [], // Link to courses if courseIds are provided
//         },
//       },
//     });

//     res.status(201).json({
//       message: "Teacher registered successfully",
//       teacher: newTeacher,
//     });
//   } catch (error) {
//     console.error("Error registering teacher:", error.message, error.stack);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// Register a new teacher
exports.registerTeacher = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { firstName, lastName, email, phone } = req.body;
  
      // Check if the teacher already exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email }
      });
  
      if (existingTeacher) {
        return res.status(400).json({ message: "Teacher with this email already exists" });
      }
  
      // Create new teacher record
      const newTeacher = await prisma.teacher.create({
        data: {
          firstName,
          lastName,
          email,
          phone
        },
      });
  
      res.status(201).json({
        message: "Teacher registered successfully",
        teacher: newTeacher
      });
    } catch (error) {
      console.error("Error registering teacher:", error.message, error.stack);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
// Get teacher details
exports.getTeacherDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Fetch specific teacher by ID, including their courses
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          courses: true, // Including courses taught by the teacher
        },
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      res.status(200).json(teacher);
    } else {
      // Fetch all teachers, including their courses
      const teachers = await prisma.teacher.findMany({
        include: {
          courses: true, // Including courses taught by each teacher
        },
      });
      res.status(200).json(teachers);
    }
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update teacher details
exports.updateTeacherDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, courseIds } = req.body;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        courses: {
          connect: courseIds ? courseIds.map(courseId => ({ id: courseId })) : [], // Update courses
        },
      },
    });

    res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete teacher record
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await prisma.teacher.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Server error" });
  }
};
