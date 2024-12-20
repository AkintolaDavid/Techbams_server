const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyAdminToken = require("../middleware/verifyAdminToken ");
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});
router.delete("/:id", verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "user deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});
module.exports = router;
