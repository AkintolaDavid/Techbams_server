const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => new Date().getTime().toString(), // Auto-generate a timestamp-based ID
  },
  name: { type: String, required: true }, // Name of the person
  email: { type: String, required: true }, // Email of the person
  number: { type: Number, required: true }, // Phone number
  message: { type: String, required: true }, // Message content
  date: { type: Date, default: Date.now }, // Timestamp for when the message was sent
});

module.exports = mongoose.model("Contact", ContactSchema);
