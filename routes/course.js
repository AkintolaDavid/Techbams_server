// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course"); // Import your Course model
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const verifyAdminToken = require("../middleware/verifyAdminToken ");
const verifyTokenForAdminOrUser = require("../middleware/verifyTokenForAdminOrUser");
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos", // Folder name in Cloudinary
    resource_type: "video", // Specify video type
    allowed_formats: ["mp4", "avi", "mkv"], // Allowed video formats
  },
});
const videoUpload = multer({ storage: videoStorage });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resources"); // The folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set file name with timestamp to avoid duplicates
  },
});

const upload = multer({ storage });

router.post(
  "/uploadResource",
  verifyAdminToken,
  upload.single("resource"),
  (req, res) => {
    try {
      // File path on the server
      const fileUrl = `/uploads/resources/${req.file.filename}`;

      res.status(200).json({ fileUrl });
    } catch (err) {
      console.error("Error during file upload:", err);
      res.status(500).json({ message: "File upload failed", error: err });
    }
  }
);
router.post(
  "/uploadVideo",
  verifyAdminToken,
  videoUpload.single("video"),
  (req, res) => {
    try {
      res.status(200).json({ videoUrl: req.file.path }); // Cloudinary video URL
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Video upload failed" });
    }
  }
);
router.post("/upload", verifyAdminToken, upload.single("image"), (req, res) => {
  try {
    res.status(200).json({ imageUrl: req.file.path }); // Cloudinary URL
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
});
// POST route to save a course
router.post("/addCourse", verifyAdminToken, async (req, res) => {
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

router.get("/", verifyTokenForAdminOrUser, async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch courses from MongoDB
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});

router.get("/:id", verifyTokenForAdminOrUser, async (req, res) => {
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

// Delete a course by ID
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params; // Use 'id' as the parameter in the route
  try {
    // Find and delete the course by its ID
    const deletedCourse = await Course.findByIdAndDelete(id);

    // If no course is found, return a 404 error
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return a success message if the course was deleted
    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    console.error("Error deleting course:", error);
    // Return a 500 error if something goes wrong on the server
    res.status(500).json({ error: "Error deleting course" });
  }
});

module.exports = router;
