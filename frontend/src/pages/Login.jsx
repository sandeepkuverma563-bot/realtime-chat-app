import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/chat");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[450px]">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Login
          </button>
          <div className="text-center mt-5">
            <p className="text-gray-600">Don't have an account?</p>

            <Link to="/signup" className="text-green-600 font-semibold">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
