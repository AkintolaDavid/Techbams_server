const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
require("dotenv").config();

// POST /send-otp
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (email !== process.env.OWNER_EMAIL) {
    return res.status(403).json({ message: "Unauthorized email" });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  try {
    // Save OTP to the database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await Otp.create({ email, otp, expiresAt });

    // Send email with OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Admin OTP",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
});

// POST /verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP in the database
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check OTP expiration
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Generate the JWT
    const tokenPayload = {
      id: email, // Using email as a unique ID for admin
      email,
      role: "admin", // Assign admin role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token valid for 1 hour
    });

    // Delete OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      admin: {
        role: tokenPayload.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
});

module.exports = router;
