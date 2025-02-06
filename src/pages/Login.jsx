import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";  // Import AuthContext
import loginImage from "../assets/login.png";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false); 
  const navigate = useNavigate(); 

  // Access the AuthContext
  const { login } = useContext(AuthContext);  // Use context login function

  const sendOtp = async (email) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      setOtpSent(true);
      alert("OTP sent to your email. Please check your inbox.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    setError("");
    try {
      let response;
      let data;

      if (isGoogleLogin) {
        response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: values.token }),
        });
        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google login failed");
        }
      } else if (otpSent) {
        response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/verify-otp`, {
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
        response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        data = await response.json();

        if (!response.ok) {
          if (data.message === "Invalid password") {
            setOtpSent(true);
            alert("Password incorrect. OTP has been sent to your email. Please enter the OTP.");
            return;
          }
          throw new Error(data.message || "Something went wrong");
        }
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        login();  // Update context state after successful login
        navigate("/");  // Redirect after login
      } else {
        console.log("No token received", data); 
        throw new Error("Token is missing in response");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    setIsGoogleLogin(true);  // Mark as Google login
    handleLogin({ token });  // Pass token to backend
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full flex">
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
              <Link to="/signup" className="text-indigo-500 hover:underline">
                Create Account
              </Link>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => sendOtp(email)}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-500 transition duration-200"
            >
              Send OTP
            </button>
          </div>

          <div className="mt-4 text-center">
          <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google Login Failed")}
              useOneTap
              shape="rectangular"
            />
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center">
          <img src={loginImage} alt="Login" className="w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
};

export default Login;
