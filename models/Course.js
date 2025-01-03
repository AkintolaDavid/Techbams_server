const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  time: String,
  note: String,
});

const resourceSchema = new mongoose.Schema({
  name: String,
  link: String,
});

const sectionSchema = new mongoose.Schema({
  sectiontitle: String,
  sectiondescription: String,
  videoUrl: String,
  timeline: [timelineSchema],
  resources: [resourceSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  description: String,
  rating: Number,
  lecturer: String,
  img: String,
  category: String,
  sections: [sectionSchema],
  whatYouWillLearn: [String],
  dateCreated: { type: Date, default: Date.now },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add this field
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
