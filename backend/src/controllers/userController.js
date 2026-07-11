const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.userId },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: req.file.path,
      },
      {
        new: true,
      }
    );
    console.log(req.file);
    res.json(updatedUser);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  uploadProfilePic,
};