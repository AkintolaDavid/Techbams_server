const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  description: String,
  img: String,
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
