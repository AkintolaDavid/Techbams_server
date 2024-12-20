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
module.exports = router;
