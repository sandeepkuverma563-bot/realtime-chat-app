import axios from "axios";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import API_BASE_URL from "../config/api";

function Settings() {
  const { darkMode, setDarkMode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [preview, setPreview] = useState(user?.profilePic || "");
  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    setPreview(URL.createObjectURL(file));
  };

  const saveProfilePic = async () => {
    try {
      if (!selectedFile) return;

      const formData = new FormData();

      formData.append("image", selectedFile);

      const token = localStorage.getItem("token");

      await axios.post(`${API_BASE_URL}/api/users/upload-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Profile updated");
    } catch (error) {
      console.log(error);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreview("");
  };
  return (
    <div
      className={`min-h-screen flex justify-center items-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`p-8 rounded-lg shadow-lg w-[500px] ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Dark Mode */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <span className="font-medium">Dark Mode</span>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded text-white ${
              darkMode ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            {darkMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Profile Upload */}
        <div>
          <h2 className="font-semibold mb-3">Profile Picture</h2>

          <div className="flex justify-center mb-4">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold">
                {user?.fullName?.charAt(0)}
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            id="profileUpload"
            className="hidden"
          />

          <label
            htmlFor="profileUpload"
            className="cursor-pointer inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow"
          >
            Choose Profile Picture
          </label>
          <div className="flex gap-3 mt-4">
            <button
              onClick={saveProfilePic}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={cancelSelection}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
          {uploading && (
            <p className="text-emerald-500 mt-3">
              Uploading profile picture...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
