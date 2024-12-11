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

module.exports = router;
