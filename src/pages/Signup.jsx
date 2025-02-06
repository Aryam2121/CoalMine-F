import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate,Link } from "react-router-dom";
import safetyManagement from "../assets/safety management.webp";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker", // Default role; can be changed to supervisor/admin if needed
    agreed: false,
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      alert("Please agree to the Terms and Conditions.");
      return;
    }

    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role, // Send the role as part of the signup
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully! OTP sent to email.");
        setOtpSent(true);
      } else if (data.message === "Email already exists") {
        setUserExists(true);
        setMessage("User already exists. Please log in.");
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  const handleOtpVerification = async () => {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
        setMessage("OTP verified successfully!");
      } else {
        setMessage(data.error || "Invalid OTP");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  const handleGoogleSignup = async (response) => {
    try {
      if (!response?.credential) {
        setMessage("Google login failed. No token received.");
        return;
      }
      
      const res = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setMessage("User registered successfully with Google!");
        localStorage.setItem("authToken", data.token);  // Save token in localStorage
        navigate("/");  // Redirect after login
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-teal-100 to-teal-300">
        <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl transform transition hover:scale-105 duration-300 flex overflow-hidden">
          <div className="w-full lg:w-1/2 p-8">
            <h1 className="text-4xl font-bold text-teal-700 mb-6">Mine Manager!</h1>
            <p className="text-gray-600 mb-8 text-lg">
              The Mine Manager community has recently decided to meet new people. Let’s meet.
            </p>

            {message && (
              <p className="text-green-600 mb-4 animate-pulse">{message}</p>
            )}
            {/* Login Instead Button */}
            <div className="mb-6">
              <Link to="/login" className="text-teal-500 hover:underline">
                Already have an account? Login here.
              </Link>
            </div>

            <div className="mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => setMessage("Google login failed.")}
                className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition duration-300 mb-4"
              />
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block mb-6">
                <span className="text-gray-700 text-sm">New ID *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your ID"
                  className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                  required
                />
              </label>

              <label className="block mb-6">
                <span className="text-gray-700 text-sm">Email *</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                  required
                />
              </label>

              <label className="block mb-6">
                <span className="text-gray-700 text-sm">Password *</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                  required
                />
              </label>

              <label className="block mb-6">
                <span className="text-gray-700 text-sm">Role *</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                  required
                >
                  <option value="worker">Worker</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  I agree to the {" "}
                  <a
                    href="#"
                    className="text-teal-600 hover:underline hover:text-teal-800"
                  >
                    Terms and Conditions & Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 hover:shadow-lg transition duration-300"
              >
                Next Step
              </button>
            </form>

            {userExists && (
              <button
                onClick={() => navigate("/login")}
                className="mt-4 w-full bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 hover:shadow-lg transition duration-300"
              >
                Login Instead
              </button>
            )}

            {otpSent && !isVerified && (
              <div className="mt-6">
                <label className="block mb-4">
                  <span className="text-gray-700 text-sm">Enter OTP</span>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                    required
                  />
                </label>

                <button
                  onClick={handleOtpVerification}
                  className="w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 hover:shadow-lg transition duration-300"
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block w-1/2 bg-teal-500 text-white">
            <img
              src={safetyManagement}
              alt="Safety Management"
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;

