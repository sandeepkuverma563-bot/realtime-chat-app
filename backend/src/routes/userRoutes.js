const express = require("express");
const {
  getProfile,
  updateProfile,
  getUsers,
  uploadProfilePic,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.post(
  "/upload-profile",
  protect,
  upload.single("image"),
  uploadProfilePic,
);

router.get("/", protect, getUsers);

module.exports = router;
