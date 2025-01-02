const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    country: { type: String, required: true }, // Changed from countryCode to country
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        score: {
          type: Number,
          default: 0, // Default score
        },
      },
    ],
    otp: { type: String, required: false, default: null }, // Allow null
    otpExpiration: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
