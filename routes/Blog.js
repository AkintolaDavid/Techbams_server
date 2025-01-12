// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Blog = require("../models/Blog");
const verifyAdminToken = require("../middleware/verifyAdminToken ");
const verifyTokenForAdminOrUser = require("../middleware/verifyTokenForAdminOrUser");
router.post("/", verifyAdminToken, async (req, res) => {
  try {
    const { title, description, img } = req.body;
    const existingTitle = await Blog.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Blog Title already exists" });
    }

    // Validate required fields
    if (!title || !description || !img) {
      return res
        .status(400)
        .json({ message: "Title, description, and image are required." });
    }

    const newBlog = new Blog({
      title,
      description,
      img,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog added successfully", blog: newBlog });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error adding blog. Please try again later." });
  }
});

router.get("/", async (req, res) => {
  try {
    const blog = await Blog.find(); // Fetch blog from MongoDB
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog" });
  }
});
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params; // Use 'id' as the parameter in the route
  try {
    // Find and delete the course by its ID
    const deletedBlog = await Blog.findByIdAndDelete(id);

    // If no Blog is found, return a 404 error
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Return a success message if the Blog was deleted
    res.status(200).json({ message: "Blog deleted successfully!" });
  } catch (error) {
    console.error("Error deleting Blog:", error);
    // Return a 500 error if something goes wrong on the server
    res.status(500).json({ error: "Error deleting Blog" });
  }
});
module.exports = router;
