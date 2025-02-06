import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  // Get the email from localStorage or session to verify OTP
  const email = localStorage.getItem("email"); // You can also use state or context to store this data

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`https://${import.meta.env.VITE_BACKEND}/api/auth/verify-otp`, {
        email: email,
        otp: otp,
      });
      setMessage(response.data.message);
      if (response.data.success) {
        navigate("/"); // Redirect to dashboard after successful OTP verification
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleVerifyOTP}>
        <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Verify OTP
        </button>
        <p className="text-red-500 mt-2">{message}</p>
      </form>
    </div>
  );
};

export default VerifyOTP;
