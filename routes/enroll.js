const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyUserToken = require("../middleware/verifyUserToken");

// Enroll in a course
router.post("/", verifyUserToken, async (req, res) => {
  const { courseId } = req.body;

  try {
    // `verifyUserToken` adds the `userId` to `req.user`
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the course is already enrolled
    const alreadyEnrolled = user.courses.some(
      (course) => course.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Add the course to the user's enrolled courses
    user.courses.push({ courseId, score: 0 }); // Default score is 0
    await user.save();

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/enrollments", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming JWT or session middleware provides the authenticated user ID
    console.log(userId);
    const user = await User.findById(userId).populate("courses.courseId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrolledCourses = user.courses.map((course) => ({
      ...course.courseId.toObject(),
      score: course.score,
    }));

    res.json(enrolledCourses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
