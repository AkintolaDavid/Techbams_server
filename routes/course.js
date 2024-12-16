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
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx", "pptx"], // Allowed file types
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
router.post("/uploadResource", async (req, res) => {
  try {
    // Extract base64 file data from the request body
    const { fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ message: "No file data provided." });
    }

    // Decode the base64 file data
    const buffer = Buffer.from(fileData, "base64");

    // Upload the file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload_stream(
      {
        folder: "courses", // Cloudinary folder
        allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx", "pptx"], // Allowed formats
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Error uploading file to Cloudinary", error });
        }

        // Send back the Cloudinary file URL
        res.status(200).json({ fileUrl: result.secure_url });
      }
    );

    // Stream the file data to Cloudinary
    cloudinaryResponse.end(buffer);
  } catch (err) {
    console.error("Error during file upload:", err);
    res.status(500).json({ message: "File upload failed", error: err });
  }
});

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

    // Validate required fields
    if (!title || !description || !rating) {
      return res
        .status(400)
        .json({ message: "Title, description, and rating are required." });
    }

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
    res
      .status(500)
      .json({ message: "Error adding course. Please try again later." });
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
