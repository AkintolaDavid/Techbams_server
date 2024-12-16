const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/course");

const cors = require("cors");
// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:5173", "https://techbams.vercel.app"], // Replace with your frontend URL in production
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization,multipart/form-data",
};

app.use(cors(corsOptions));
connectDB(); // Using the `connectDB` function from db.js

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/courses", courseRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
