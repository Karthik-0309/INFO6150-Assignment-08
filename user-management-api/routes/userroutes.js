const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Will be created later
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(file.mimetype);
    if (extName) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  } 
});

// Routes
router.post('/create', userController.createUser);
router.put('/edit', userController.updateUser);
router.delete('/delete', userController.deleteUser);
router.get('/getAll', userController.getAllUsers);
router.post('/uploadImage', upload.single('image'), userController.handleUpload);

module.exports = router;
