import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center w-[596px] h-[400px] flex flex-col ">
        <h1 className="text-4xl font-bold text-green-600 mb-10">
          Wel-Come To The Realtime Chat App
        </h1>

        <p className="text-gray-600 mb-8">Connect with your friends instantly</p>

        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="border border-green-500 text-green-500 hover:bg-green-50 py-3 rounded-lg font-semibold"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
