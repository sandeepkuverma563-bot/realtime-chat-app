const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://realtime-chat-app-1-x04s.onrender.com");

export default API_BASE_URL;
