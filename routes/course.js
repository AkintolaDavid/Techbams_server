// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course"); // Import your Course model
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed file types
  },
});
const upload = multer({ storage });
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos", // Folder name in Cloudinary
    resource_type: "video", // Specify video type
    allowed_formats: ["mp4", "avi", "mkv"], // Allowed video formats
  },
});
const videoUpload = multer({ storage: videoStorage });
router.post("/uploadVideo", videoUpload.single("video"), (req, res) => {
  try {
    res.status(200).json({ videoUrl: req.file.path }); // Cloudinary video URL
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Video upload failed" });
  }
});
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.status(200).json({ imageUrl: req.file.path }); // Cloudinary URL
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
});
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
