const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String], // Multiple choices
  correctAnswerIndex: Number, // Index of the correct option
});

const quizSchema = new mongoose.Schema({
  title: String, // Quiz title
  questions: [questionSchema],
});
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
  quiz: quizSchema,
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
  enrolledUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fullName: String,
      email: String,
    },
  ],
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
