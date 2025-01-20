// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Blog = require("../models/Blog");
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

// POST route to save a course
router.post("/addCourse", verifyAdminToken, async (req, res) => {
  try {
    const {
      title,
      description,
      rating,
      lecturer,
      img,
      category,
      sections,
      whatYouWillLearn,
    } = req.body;
    const existingTitle = await Course.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Course Title already exists" });
    }

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
      whatYouWillLearn,
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
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params; // Use 'id' as the parameter in the route
  try {
    // Find and delete the course by its ID
    const deletedCourse = await Course.findByIdAndDelete(id);

    // If no Course is found, return a 404 error
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return a success message if the Course was deleted
    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    console.error("Error deleting Course:", error);
    // Return a 500 error if something goes wrong on the server
    res.status(500).json({ error: "Error deleting Blog" });
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

router.put("/course/:id/learn", async (req, res) => {
  const { id } = req.params;
  const { whatYouWillLearn } = req.body;

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      { whatYouWillLearn },
      { new: true }
    );
    res.status(200).json({ message: "Updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Failed to update", error });
  }
});
// Add Quiz to Section
router.post("/:courseId/section/:sectionId/quiz", async (req, res) => {
  const { courseId, sectionId } = req.params;
  const { title, questions } = req.body;

  try {
    const course = await Course.findById(courseId);
    const section = course.sections.id(sectionId);
    section.quiz = { title, questions };

    await course.save();
    res.status(200).json({ message: "Quiz added successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add quiz." });
  }
});
router.get("/:courseId/section/:sectionId/quiz", async (req, res) => {
  const { courseId, sectionId } = req.params;

  try {
    const course = await Course.findById(courseId).select(`sections._id quiz`);
    const section = course.sections.id(sectionId);

    res.status(200).json(section.quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve quiz." });
  }
});

router.post("/:courseId/section/:sectionId/quiz/submit", async (req, res) => {
  const { courseId, sectionId } = req.params;
  const { userId, answers } = req.body;

  try {
    const course = await Course.findById(courseId);
    const section = course.sections.id(sectionId);
    const { questions } = section.quiz;

    let score = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswerIndex) {
        score++;
      }
    });

    // Update user's progress in the enrolledUsers array
    const user = course.enrolledUsers.find(
      (user) => user.userId.toString() === userId
    );
    if (user) {
      user.score = score; // Save user score for the quiz
    }

    await course.save();
    res.status(200).json({ score });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit quiz." });
  }
});

module.exports = router;
