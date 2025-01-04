const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model
const Course = require("../models/Course"); // Assuming you have a Course model
const verifyUserToken = require("../middleware/verifyUserToken"); // Middleware to verify the token

// Enroll in a course
router.post("/unenroll", verifyUserToken, async (req, res) => {
  const { courseId } = req.body;

  try {
    // Get userId from the token
    const userId = req.user.userId;

    // Validate course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the user is enrolled in the course
    const isEnrolledInCourse = course.enrolledUsers.includes(userId);
    if (!isEnrolledInCourse) {
      return res
        .status(400)
        .json({ message: "You are not enrolled in this course" });
    }

    // Remove user from course's enrolledUsers
    course.enrolledUsers = course.enrolledUsers.filter(
      (enrolledUser) => enrolledUser.toString() !== userId
    );

    // Save updated course
    await course.save();

    res
      .status(200)
      .json({ message: "Successfully unenrolled from the course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.post("/", verifyUserToken, async (req, res) => {
  const { courseId } = req.body;

  try {
    // `verifyUserToken` adds the `userId` to `req.user`
    const userId = req.user.userId;

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate course existence
    const course = await Course.findById(courseId).populate({
      path: "enrolledUsers", // Path to populate
      select: "fullName email", // Fields to retrieve
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const alreadyEnrolledInCourse = course.enrolledUsers.includes(userId);

    if (alreadyEnrolledInCourse) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Add user to course's enrolledUsers
    course.enrolledUsers.push(userId);
    await course.save();

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
