const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model
const Course = require("../models/Course"); // Assuming you have a Course model
const verifyUserToken = require("../middleware/verifyUserToken"); // Middleware to verify the token

// Enroll in a course
// Enroll in a course
router.post("/", verifyUserToken, async (req, res) => {
  const { courseId } = req.body;

  try {
    // Get userId from the token
    const userId = req.user.userId;

    // Validate course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure enrolledUsers is an array and check if the user is already enrolled
    const enrolledUsers = course.enrolledUsers || [];
    const alreadyEnrolledInCourse = enrolledUsers.some(
      (user) => user.userId && user.userId.toString() === userId
    );

    if (alreadyEnrolledInCourse) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Add user to course's enrolledUsers
    course.enrolledUsers.push({
      userId: userId,
      userName: user.name, // Assuming the user's name is stored in `name` field
      userEmail: user.email, // Assuming the user's email is stored in `email` field
    });
    await course.save();

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Unenroll from a course
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

    // Ensure enrolledUsers is an array and check if the user is enrolled
    const enrolledUsers = course.enrolledUsers || [];
    const isEnrolledInCourse = enrolledUsers.some(
      (user) => user.userId && user.userId.toString() === userId
    );

    if (!isEnrolledInCourse) {
      return res
        .status(400)
        .json({ message: "You are not enrolled in this course" });
    }

    // Remove user from course's enrolledUsers
    course.enrolledUsers = course.enrolledUsers.filter(
      (user) => user.userId && user.userId.toString() !== userId
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

module.exports = router;
