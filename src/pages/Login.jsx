import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/login.png"; // Update with your login image path

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false); // New state to track Google login
  const navigate = useNavigate(); // For navigation after successful login

  const handleLogin = async (values) => {
    setLoading(true);
    setError("");
  
    try {
      let response;
      let data;
  
      if (isGoogleLogin) {
        // Handle Google login without password
        response = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        });
  
        data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Google login failed");
        }
      } else if (otpSent) {
        // API call for verifying OTP
        response = await fetch("http://localhost:5000/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            otp,
          }),
        });
  
        data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "OTP verification failed");
        }
      } else {
        // API call for login with email and password
        response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
  
        data = await response.json();
  
        if (!response.ok) {
          // If login fails, send OTP as fallback
          if (data.message === "Invalid password") {
            setOtpSent(true);
            alert("Password incorrect. OTP has been sent to your email. Please enter the OTP.");
            return;
          }
          throw new Error(data.message || "Something went wrong");
        }
      }
  
      // Handle successful login or OTP verification
      console.log("Login successful:", data);
  
      // Check if token is available in the response
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        throw new Error("Token is missing in response");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleLogin = () => {
    setIsGoogleLogin(true);
    // Simulate Google login process (for example, through Google OAuth)
    const token = "google-auth-token"; // Replace this with the actual Google token from the OAuth process
    handleLogin({ token }); // Pass the token to handle login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full flex">
        {/* Left side: Form */}
        <div className="w-1/2 pr-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-700">Login to Your Account</h1>
            <p className="text-gray-500">Welcome back! Please login to continue.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin({
                email: email,
                password: password,
              });
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-gray-600 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            {!otpSent && !isGoogleLogin && (
              <div>
                <label htmlFor="password" className="block text-gray-600 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-gray-600 mb-2">
                  OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your OTP"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500 transition duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : otpSent ? "Verify OTP" : "Login"}
            </button>

            <div className="text-center mt-4">
              <Link to="/register" className="text-indigo-500 hover:underline">
                Create Account
              </Link>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition duration-200"
            >
              Login with Google
            </button>
          </div>
        </div>

        {/* Right side: Image */}
        <div className="w-1/2 flex items-center justify-center">
          <img src={loginImage} alt="Login" className="w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
};

export default Login;
