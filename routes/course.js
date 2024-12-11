// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course"); // Import your Course model

// POST route to save a course
router.post("/addCourse", async (req, res) => {
  try {
    const { title, description, rating, lecturer, img, category, sections } =
      req.body;
    const newCourse = new Course({
      title,
      description,
      rating,
      lecturer,
      img,
      category,
      sections,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding course" });
  }
});
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch courses from MongoDB
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId); // Assuming your course data is in the "Course" model
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
