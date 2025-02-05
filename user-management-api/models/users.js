// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
  },
});

module.exports = mongoose.model("Usertable", userSchema);
