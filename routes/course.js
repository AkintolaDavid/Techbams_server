// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");
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
router.post("/addCourse", verifyAdminToken, async (req, res) => {
  try {
    const {
      title,
      description,
      rating,
      lecturer,
      img,
      category,
      sections, // Array of sections with quizzes
      whatYouWillLearn,
    } = req.body;

    // Check for duplicate title
    const existingTitle = await Course.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Course Title already exists" });
    }

    // Validate required course fields
    if (!title || !description || !rating || !Array.isArray(sections)) {
      return res.status(400).json({
        message: "Title, description, rating, and sections are required.",
      });
    }

    // Validate sections and quizzes
    for (const [sectionIndex, section] of sections.entries()) {
      // Optional: Skip title validation if not needed
      if (!section.title?.trim()) {
        return res.status(400).json({
          message: `Section ${sectionIndex + 1} is missing a title.`,
        });
      }

      if (section.quiz) {
        const { questions } = section.quiz;
        if (!Array.isArray(questions) || questions.length === 0) {
          return res.status(400).json({
            message: `Quiz in section "${section.title}" must have at least one question.`,
          });
        }

        questions.forEach((question, questionIndex) => {
          if (!question.questionText?.trim()) {
            throw new Error(
              `Question ${questionIndex + 1} in section "${
                section.title
              }" is missing text.`
            );
          }

          if (!Array.isArray(question.options) || question.options.length < 2) {
            throw new Error(
              `Question ${questionIndex + 1} in section "${
                section.title
              }" must have at least two options.`
            );
          }

          if (
            typeof question.correctAnswerIndex !== "number" ||
            question.correctAnswerIndex < 0 ||
            question.correctAnswerIndex >= question.options.length
          ) {
            throw new Error(
              `Question ${questionIndex + 1} in section "${
                section.title
              }" has an invalid correctAnswerIndex.`
            );
          }
        });
      }
    }

    // Save the course
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
    console.error(error.message); // Log the error for debugging
    res.status(500).json({
      message: "Error adding course. Please try again later.",
      error: error.message,
    });
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
  console.log(courseId, sectionId);
  try {
    const course = await Course.findById(courseId).select("sections"); // Fetch all sections
    console.log(course); // Verify the structure of the fetched data

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const section = course.sections.id(sectionId); // Get the specific section
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    console.log(section); // Check the retrieved section
    res.status(200).json(section.quiz); // Return the quiz object
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve quiz." });
  }
});

router.post("/:courseId/section/:sectionId/quiz/submit", async (req, res) => {
  const { courseId, sectionId } = req.params;
  const { userId, answers } = req.body;
  try {
    // Step 1: Fetch the course and section
    const course = await Course.findById(courseId);
    const section = course.sections.id(sectionId);

    if (!section || !section.quiz) {
      return res.status(404).json({ error: "Section or quiz not found." });
    }

    const { questions } = section.quiz;
    const enrolledUser = course.enrolledUsers.find(
      (user) => user.userId.toString() === userId
    );

    if (!enrolledUser) {
      return res.status(404).json({ error: "User not enrolled in course." });
    }

    // Step 3: Check attempts left
    if (enrolledUser.attempts <= 0) {
      return res.status(403).json({ error: "No more attempts left." });
    }

    // Step 4: Calculate score
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswerIndex) {
        score++;
      }
    });

    // Step 5: Update score and reduce attempts
    enrolledUser.score = Math.max(enrolledUser.score, score); // Keep highest score
    enrolledUser.attempts -= 1; // Reduce attempts

    // Step 6: Update User Progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const courseProgress = user.courses.find(
      (c) => c.courseId.toString() === courseId
    );

    if (courseProgress) {
      courseProgress.score = Math.max(courseProgress.score, score);
      courseProgress.attempts -= 1; // Reduce attempts
    } else {
      user.courses.push({ courseId, score, attempts: 2 }); // 2 attempts left after first try
    }

    // Save both course and user
    await course.save();
    await user.save();

    res.status(200).json({ score, attemptsLeft: enrolledUser.attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit quiz." });
  }
});
module.exports = router;
