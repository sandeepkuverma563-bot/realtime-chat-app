import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import API_BASE_URL from "../config/api";

function Home() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const messagesEndRef = useRef(null);
  const { darkMode } = useTheme();
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchProfile();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImage(reader.result);
    };
  };
  const sendMessage = async () => {
    if (!newMessage.trim() && !image) return;
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/messages/send/${selectedUser._id}`,
        {
          text: newMessage,
          image: image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      setImage(null);
      setLastMessages((prev) => ({
        ...prev,
        [selectedUser._id]: response.data.text,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("Received new message:", newMessage);
      setLastMessages((prev) => ({
        ...prev,
        [newMessage.senderId]: newMessage.text,
      }));

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!socket) return;

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("messagesSeen", ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            seen: true,
          })),
        );
      }
    });

    return () => {
      socket.off("messagesSeen");
    };
  }, [socket, selectedUser]);
  useEffect(() => {
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    return () => {
      socket.off("typing");
    };
  }, [socket, selectedUser]);

  return (
    <div
      className={`h-screen flex ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-1/3 flex flex-col border-r ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Profile Section */}
        <div
          className={`p-4 border-b flex items-center justify-between ${darkMode ? "border-slate-800" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt=""
                  onClick={() => {
                    setPreviewImage(user.profilePic);
                    setShowImagePreview(true);
                  }}
                  className="w-full h-full rounded-full object-cover cursor-pointer"
                />
              ) : (
                user?.fullName?.charAt(0)
              )}
            </div>

            <div>
              <h2 className="font-semibold">{user?.fullName}</h2>
              <p
                className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}
              >
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/settings")}
              className={`px-3 py-2 rounded transition active:scale-95 ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              ⚙️
            </button>

            <button
              onClick={logout}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded transition active:scale-95 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Users List Search */}
        <div className="p-3">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 outline-none transition focus:border-emerald-500 ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-emerald-500"
                : "bg-gray-50 border-gray-300 focus:border-emerald-500"
            }`}
          />
        </div>

        {/* Users List items */}
        <div className="flex-1 overflow-y-auto">
          {users
            .filter((userItem) =>
              userItem.fullName.toLowerCase().includes(search.toLowerCase()),
            )
            .map((userItem) => {
              const isSelected = selectedUser?._id === userItem._id;
              return (
                <div
                  key={userItem._id}
                  onClick={() => {
                    setUnreadCounts((prev) => ({
                      ...prev,
                      [userItem._id]: 0,
                    }));
                    setSelectedUser(userItem);
                  }}
                  className={`flex items-center gap-3 p-4 border-b cursor-pointer transition ${
                    darkMode
                      ? `border-slate-800 hover:bg-slate-800/60 ${isSelected ? "bg-emerald-950/40 border-l-4 border-l-emerald-500 pl-3" : ""}`
                      : `border-gray-100 hover:bg-gray-50 ${isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500 pl-3" : ""}`
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {userItem.profilePic ? (
                        <img
                          src={userItem.profilePic}
                          alt=""
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(userItem.profilePic);
                            setShowImagePreview(true);
                          }}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center">
                          {userItem.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                        darkMode ? "border-slate-900" : "border-white"
                      } ${
                        onlineUsers.includes(userItem._id)
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    ></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3
                        className={`font-medium truncate ${isSelected && !darkMode ? "text-emerald-900" : ""}`}
                      >
                        {userItem.fullName}
                      </h3>

                      {unreadCounts[userItem._id] > 0 && (
                        <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {unreadCounts[userItem._id]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          onlineUsers.includes(userItem._id)
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      >
                        {onlineUsers.includes(userItem._id)
                          ? "Online"
                          : "Offline"}
                      </span>
                      <p
                        className={`text-xs truncate max-w-[140px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}
                      >
                        {lastMessages[userItem._id] || "No messages"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`w-2/3 flex flex-col ${darkMode ? "bg-slate-950" : "bg-gray-50"}`}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div
              className={`border-b p-4 flex items-center gap-3 ${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt=""
                    onClick={() => {
                      setPreviewImage(selectedUser.profilePic);
                      setShowImagePreview(true);
                    }}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center">
                    {selectedUser.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  {selectedUser.fullName}
                </h2>
                <p
                  className={`text-sm flex items-center gap-1.5 ${
                    onlineUsers.includes(selectedUser._id)
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  <span>
                    {onlineUsers.includes(selectedUser._id)
                      ? "Online"
                      : "Offline"}
                  </span>
                  {isTyping && (
                    <span className="text-emerald-500 font-medium animate-pulse">
                      • Typing...
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className={`flex-1 p-4 overflow-y-auto ${darkMode ? "bg-slate-950" : "bg-gray-50"}`}
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p
                    className={`text-sm ${darkMode ? "text-slate-500" : "text-gray-450"}`}
                  >
                    No messages yet
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.senderId === user._id;

                  return (
                    <div
                      key={message._id}
                      className={`flex mb-3 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="relative group">
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="absolute -top-2 -right-2 hidden group-hover:block bg-red-500 text-white rounded-full px-2"
                          >
                            ×
                          </button>
                        )}

                        <div
                          className={`px-4 py-2 rounded-xl max-w-xs md:max-w-md break-words shadow-sm text-sm ${
                            isMe
                              ? "bg-emerald-600 text-white rounded-tr-none"
                              : darkMode
                                ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50"
                                : "bg-white text-gray-800 rounded-tl-none border border-gray-150"
                          }`}
                        >
                          <>
                            {message.image && (
                              <img
                                src={message.image}
                                alt=""
                                onClick={() => {
                                  setPreviewImage(message.image);
                                  setShowImagePreview(true);
                                }}
                                className="max-w-[200px] rounded-lg mb-2 cursor-pointer hover:opacity-90"
                              />
                            )}

                            {message.text}

                            {isMe && (
                              <div className="text-[10px] mt-1 text-right">
                                {message.seen ? "✓✓ Seen" : "✓ Sent"}
                              </div>
                            )}
                            <div
                              className={`text-[10px] mt-1 text-right ${
                                isMe ? "text-emerald-100" : "text-slate-400"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
              className={`border-t p-4 flex gap-2 ${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-gray-200"
              }`}
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  className="w-24 h-24 object-cover rounded-lg mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                id="chatImage"
                className="hidden"
              />

              <label
                htmlFor="chatImage"
                className="cursor-pointer bg-gray-200 px-4 py-3 rounded-full"
              >
                📷
              </label>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  socket?.emit("typing", {
                    receiverId: selectedUser._id,
                    senderId: user._id,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className={`flex-1 border rounded-full px-4 py-2.5 outline-none transition ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-emerald-500"
                    : "bg-gray-50 border-gray-300 focus:border-emerald-500"
                }`}
              />

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() && !image}
                className={`px-6 rounded-full font-semibold transition duration-150 active:scale-95 text-white ${
                  !newMessage.trim() && !image
                    ? "bg-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            className={`flex-1 flex flex-col items-center justify-center gap-2 ${darkMode ? "text-slate-500" : "text-gray-400"}`}
          >
            <span className="text-4xl">💬</span>
            <div className="text-xl font-medium">
              Select a user to start chatting
            </div>
          </div>
        )}
      </div>
      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={previewImage}
            alt=""
            className="max-w-[500px] max-h-[500px] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

export default Home;
