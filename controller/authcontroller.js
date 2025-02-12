
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
//fuction to handle user signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;

    // Check if client already exists
    const existingClient = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });
    //if user already exists
    if (existingClient) {
      return res.status(400).json({ message: "Client already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new client
    const User = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    // Generate JWT token
    const token = jwt.sign(
      {
        id: User.id,
        email: User.email,
        name: User.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);

    // Send response with token and details of user
    res.status(201).json({
      message: "Client registered successfully",
      token: token,
      client: {
        id: User.id,
        name: User.name,
        email: User.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//fuction to handle user login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if email exists
    const Client = await prisma.user.findFirst({
      where: {
        // OR: [{ email }, { username }],
        email: email,
      },
    });

    if (!Client) {
      return res.status(400).json({ message: "Client does not exists" });
    }

    //compare password
    const match = await bcrypt.compare(password, Client.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: Client.id,
        email: Client.email,
        username: Client.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);

    // Send response with token and details of user
    res.status(201).json({
      message: "Client logins successfully",
      token: token,
      client: {
        id: Client.id,
        email: Client.email,
        username: Client.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
