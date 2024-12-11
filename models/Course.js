// backend/models/Course.js
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
  title: String,
  description: String,
  rating: Number,
  lecturer: String,
  img: String,
  category: String,
  sections: [sectionSchema],
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
