const User = require("../models/users");
const bcrypt = require("bcrypt");
const multer = require("multer");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user and save to the database
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle MongoDB duplicate key error (if any)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }

    console.error("Error creating user:", error); // Log the error for debugging
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
    let updateFields = { fullName };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt); // Hash password if provided
    }

    const updatedUser = await User.findOneAndUpdate(
      { email }, // Search by email
      updateFields, // Fields to update
      { new: true, runValidators: true } // Return updated document, validate fields
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error); // Added logging
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { email } = req.body;

  try {
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Added logging
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Added logging
    res.status(500).json({ message: error.message });
  }
};

// Set up the storage engine (optional)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Set a unique file name
  },
});

// Set up the multer upload middleware with file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Check the file type to accept only .png
    if (file.mimetype === "image/png") {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only PNG files are allowed"), false); // Reject the file
    }
  },
}).single("image"); // 'image' is the field name for the file

// Handle file upload and user update
exports.handleUpload = async (req, res) => {
  try {
    console.log("Email received:", req.body.email); // Log the email

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save the file path to the user's record
    const filePath = req.file.path;
    const email = req.body.email; // Assuming email is provided in the request body

    console.log("File path:", filePath); // Log the file path

    const updatedUser = await User.findOneAndUpdate(
      { email }, // Find the user by email
      { imagePath: filePath }, // Save the file path to imagePath field
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({
        message: "Image uploaded and user updated successfully",
        filePath: req.file.path,
      });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message });
  }
};
