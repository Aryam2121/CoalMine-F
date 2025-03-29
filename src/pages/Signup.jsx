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

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email format.";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(formData.password)) newErrors.password = "Must include an uppercase letter.";
    if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = "Must include a special character.";
    if (!formData.role) newErrors.role = "Please select a role.";
    if (!formData.agreed) newErrors.agreed = "You must agree to the terms.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("User registered successfully! OTP sent.");
        setOtpSent(true);
      } else if (data.message === "Email already exists") {
        setUserExists(true);
        setMessage("User already exists. Please log in.");
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch {
      setMessage("Server error. Please try again later.");
    }
    setLoading(false);
  };

  const handleOtpVerification = async () => {
    if (!formData.otp.trim()) {
      setErrors({ ...errors, otp: "OTP is required." });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
        setMessage("OTP verified successfully!");
      } else {
        setMessage(data.error || "Invalid OTP. Try again.");
      }
    } catch {
      setMessage("Server error. Please try again later.");
    }
    setOtpLoading(false);
  };

  const handleGoogleSignup = async (response) => {
    if (!response?.credential) {
      setMessage("Google login failed. Please try again.");
      return;
    }

    if (!formData.role) {
      setMessage("Please select a role before signing up with Google.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential, role: formData.role }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("User registered successfully with Google!");
        localStorage.setItem("authToken", data.token);
        navigate("/");
      } else {
        setMessage(data.message || "Google signup failed.");
      }
    } catch {
      setMessage("Server error. Try again later.");
    }
    setLoading(false);
  };
  
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

<div className="flex min-h-screen items-center justify-center bg-gray-900">
    <div className="bg-white w-full max-w-4xl rounded-lg border border-gray-200 shadow-3xl transform transition hover:scale-[1.03] duration-300 flex overflow-hidden">
        <div className="w-full lg:w-1/2 p-10">
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
                    className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 hover:shadow-xl transition duration-300"
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
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-400 transition duration-300 hover:shadow-lg"
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
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-400 transition duration-300 hover:shadow-lg"
                        required
                    />
                </label>

                <label className="block mb-6">
                    <span className="text-gray-700 text-sm">Password *</span>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Enter password" 
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-400 transition duration-300 hover:shadow-lg" 
                            required 
                        />
                        <button 
                            type="button" 
                            className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 transition duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </label>

                <label className="block mb-6">
                    <span className="text-gray-700 text-sm">Role *</span>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-400 transition duration-300 hover:shadow-lg"
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="worker">Worker</option>
                        <option value="Inspector">Inspector</option>
                        <option value="Super admin">Super Admin</option>
                        <option value="Mine admin">Mine Admin</option>
                        <option value="Safety Manager">Safety Manager</option>
                        <option value="Shift Incharge">Shift Incharge</option>
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
                        <a href="#" className="text-teal-600 hover:underline hover:text-teal-800">
                            Terms and Conditions & Privacy Policy
                        </a>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 hover:shadow-xl transition duration-300"
                >
                    {loading ? "Processing..." : "Next Step"}
                </button>
            </form>

            {userExists && (
                <button
                    onClick={() => navigate("/login")}
                    className="mt-4 w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 hover:shadow-lg transition duration-300"
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
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-400 transition duration-300 hover:shadow-lg"
                            required
                        />
                    </label>

                    <button
                        onClick={handleOtpVerification}
                        className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 hover:shadow-xl transition duration-300"
                    >
                        Verify OTP
                    </button>
                </div>
            )}
        </div>

        <div className="hidden lg:block w-1/2 bg-teal-500 text-white">
            <img src={safetyManagement} alt="Safety Management" className="object-cover h-full w-full" />
        </div>
    </div>
</div>

    </GoogleOAuthProvider>
  );
};

export default Signup;

