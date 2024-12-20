const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");
const verifyTokenForAdminOrUser = require("../middleware/verifyTokenForAdminOrUser");
const sendOwnerMail = async (name, email, number, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "donations@elearning.com",
    to: process.env.OWNER_EMAIL,
    subject: `A contact message was sent by ${name}`,
    text: `Dear Birdkin,\n\nYou have a new message:\n\nFrom: ${email}\nPhone: ${number}\nMessage: ${message}`,
  };

  await transporter.sendMail(mailOptions);
};

router.get("/", verifyTokenForAdminOrUser, async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
});

router.post("/", verifyTokenForAdminOrUser, async (req, res) => {
  const { name, email, number, message } = req.body;

  if (!name || !email || !number || !message) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const newContact = new Contact({ name, email, number, message });
    await newContact.save();

    await sendOwnerMail(name, email, number, message);

    res.status(200).json({
      message: "Your message has been received and saved. Thank you!",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save contact to the database." });
  }
});

module.exports = router;
