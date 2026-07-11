const Message = require("../models/Message");
const { getIO, getReceiverSocketId } = require("../../socket");
const cloudinary = require("../config/cloudinary");
const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;

    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({
        message: "Message or image required",
      });
    }
    const senderId = req.user.userId;

    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    console.log("Saved Message:", newMessage);

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.id;

    const myId = req.user.userId;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: myId,
        },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: myId,
        seen: false,
      },
      {
        seen: true,
      },
    );

    const senderSocketId = getReceiverSocketId(otherUserId);

    if (senderSocketId) {
      getIO().to(senderSocketId).emit("messagesSeen", {
        senderId: myId,
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      messageId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
};
