import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const prisma = new PrismaClient();

app.use(express.json());
// Secure Cookies Settings
app.use(cookieParser());

app.post(
  "/register",
  [
    body("username")
      .notEmpty()
      .withMessage("Required")
      .isString()
      .isLength({ min: 5, max: 16 })
      .withMessage("Username must have 5-16 characters"),
    body("password")
      .notEmpty()
      .withMessage("Required")
      .isString()
      .isLength({ min: 8, max: 32 })
      .withMessage("Password mus have 8-32 characters")
      .matches(/\d/)
      .withMessage(
        "Password must include a number, a lowercase letter, a uppercase letter and a special character",
      )
      .matches(/[a-z]/)
      .withMessage(
        "Password must include a number, a lowercase letter, a uppercase letter and a special character",
      )
      .matches(/[A-Z]/)
      .withMessage(
        "Password must include a number, a lowercase letter, a uppercase letter and a special character",
      )
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage(
        "Password must include a number, a lowercase letter, a uppercase letter and a special character",
      ),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Required")
      .isString()
      .isLength({ min: 8, max: 32 })
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ message: "Username is already taken", statusCode: 400 });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
        },
      });
      // Remove the hashed password from the response
      const { passwordHash, ...userWithoutPassword } = newUser;

      res.status(201).send({
        message: "User created successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).send({ message: "Error creating user", statusCode: 500 });
    }
  },
);

const verifyToken = (token) => {
  try {
    const userToken = jwt.verify(token, process.env.CHAT_SECRET_KEY);
    return userToken;
  } catch (error) {
    console.log("Token ERROR: ", error);
    return null;
  }
};

app.get("/api/auth/validate", (req, res) => {
  const { authToken } = req.cookies;
  if (authToken) {
    const user = verifyToken(authToken);
    if (user) {
      return res.json({ isAuthenticated: true, user });
    }
  }
  return res.json({ isAuthenticated: false });
});

app.post(
  "/login",
  [
    body("username")
      .notEmpty()
      .withMessage("Required")
      .isString()
      .isLength({ min: 5, max: 16 })
      .withMessage("Username Invalid"),
    body("password")
      .notEmpty()
      .withMessage("Required")
      .isString()
      .isLength({ min: 8, max: 32 })
      .withMessage("Password Invalid")
      .matches(/\d/)
      .withMessage("Password Invalid")
      .matches(/[a-z]/)
      .withMessage("Password Invalid")
      .matches(/[A-Z]/)
      .withMessage("Password Invalid")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password Invalid"),
  ],
  async (req, res) => {
    // User Authentication
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    // User Example
    const { username, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (
      !existingUser ||
      !(await bcrypt.compare(password, existingUser.passwordHash))
    ) {
      return res
        .status(401)
        .send({ message: "Username or Password Invalid", statusCode: 401 });
    }

    const secretKey = process.env.CHAT_SECRET_KEY;
    if (!secretKey) {
      return res
        .status(500)
        .send({ message: "Server misconfiguration", statusCode: 500 });
    }

    const token = jwt.sign({ id: existingUser.id }, secretKey, {
      expiresIn: "1h",
    });
    res.cookie("authToken", token, {
      hhtpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3600000,
    });
    res.json({ isAuthenticated: true, message: "Logged in successfully." });
  },
);

app.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  res.json({ isAuthenticated: false, message: "Logged out successfully." });
});

// Serve Vite build files
app.use(express.static(path.join(path.resolve(), "../client/dist")));

// SPA fallback: Direct all non-API and non-static requests to your index.html
app.get(/^(?!\/api).*/, (req, res) => {
  // This regex excludes paths starting with /api
  res.sendFile(path.join(path.resolve(), "../client/dist/index.html"));
});

io.on("connection", (socket) => {
  console.log("New client Connected!");

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
