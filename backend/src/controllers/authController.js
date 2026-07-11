const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};

    if (!fullName) {
        return res.status(400).json({
        message: "Please Enter your Name",
        });
    }
    if(!email) {
        return res.status(400).json({
        message: "Please Enter your Email",
        });
    }
    if(!password) {
        return res.status(400).json({
        message: "Please Enter your Password",
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
        message: "Password must be at least 6 characters long",
        });
    }
    
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
    });
    const token = jwt.sign(
    {
        userId: user._id,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d",
    });

    res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        },
    });
    } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email) {
      return res.status(400).json({
        message: "Please Enter your Email",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Please Enter your Password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


module.exports = {
  registerUser,
  loginUser,
};