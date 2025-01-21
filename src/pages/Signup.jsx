import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import safetyManagement from "../assets/safety management.webp";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreed: false,
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userExists, setUserExists] = useState(false); // State to check if user exists
  const navigate = useNavigate(); // Initialize navigate

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
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully!");
        setOtpSent(true);
      } else if (data.message === "User already exists") {
        setUserExists(true); // Set userExists to true if the user exists
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
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
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
      const res = await fetch("http://localhost:5000/api/auth/google", {
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
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="415677898308-qbe137kknqc0d3j8hnf2gbrvs47k95aa.apps.googleusercontent.com">
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
                onClick={() => navigate("/login")} // Navigate to login
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
                    placeholder="Enter OTP sent to your email"
                    className="mt-1 block w-full p-3 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 transition duration-300 hover:shadow-lg"
                    required
                  />
                </label>
                <button
                  type="button"
                  onClick={handleOtpVerification}
                  className="w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 hover:shadow-lg transition duration-300"
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>
  
          <div className="w-full lg:w-1/2c flex justify-center items-center bg-gradient-to-r from-teal-500 to-teal-700">
            <img
              src={safetyManagement}
              alt="Mine Manager"
              className="w-full h-full object-cover rounded-r-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;
