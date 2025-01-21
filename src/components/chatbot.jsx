import React, { useState } from "react";

import axios from "axios";
import { motion } from "framer-motion";


const getChatResponse = async (message, language) => {
  try {
  
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAYIAIPhO-g0GQR9CXD-DfXKNTa_ePG5YU`;

    // Payload for Gemini API
    const payload = {
      contents: [{
        parts: [{ text: message }],
      }],
    };

    // Call the Gemini API
    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse response and get the text from the first candidate
    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no reply from Gemini';
    return botReply;
  } catch (error) {
    console.error('Error with Gemini API:', error.response?.data || error.message);
    return 'Sorry, something went wrong!';
  }
};
const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to handle popup visibility

 
  const handleSendMessage = async () => {
    if (!message) return;

    setLoading(true);
    setConversation([...conversation, { sender: "user", text: message }]);

    try {
      // Get the bot's response from Gemini API
      const reply = await getChatResponse(message, language);

      // Add the bot's response to the conversation
      setConversation((prev) => [
        ...prev,
        { sender: "user", text: message },
        { sender: "bot", text: reply },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setConversation((prev) => [
        ...prev,
        { sender: "user", text: message },
        { sender: "bot", text: "Sorry, I couldn't understand that." },
      ]);
    }

    setMessage("");
    setLoading(false);
  };
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
    {/* Chatbot Button */}
    {!isOpen && (
      <button
        onClick={togglePopup}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500"
      >
        <img
          src="/path/to/chatbot-logo.png"  // Update with your actual logo path
          alt="Chatbot Logo"
          className="w-8 h-8 object-cover transition-all duration-300 transform hover:rotate-45"  // Added rotation effect on hover
        />
      </button>
    )}
  
    {/* Chatbot Popup */}
    {isOpen && (
      <motion.div
        className="fixed bottom-6 right-6 w-full max-w-md bg-white p-6 rounded-lg shadow-xl border border-gray-200 z-50"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-indigo-600">Multilingual Chatbot</h1>
          <button
            onClick={togglePopup}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-all duration-200 focus:outline-none"
          >
            &times;
          </button>
        </div>
  
        {/* Language Dropdown */}
        <div className="mb-6">
          <label htmlFor="language" className="block text-lg font-medium text-gray-700 mb-2">
            Choose Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="hi">Hindi</option>
            {/* Add more languages as needed */}
          </select>
        </div>
  
        {/* Conversation Area */}
        <div className="h-72 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          {conversation.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg transition-all duration-300 transform ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-gray-300 to-gray-100 text-gray-800 shadow-sm scale-100"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              className="text-left mb-3 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded-lg">
                Typing...
              </div>
            </motion.div>
          )}
        </div>
  
        {/* Message Input and Send Button */}
        <div className="flex items-center space-x-4">
          <div className="relative w-full">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 focus:border-indigo-500"
              placeholder="Type your message..."
            />
            {message && (
              <button
                onClick={() => setMessage('')}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg disabled:bg-gray-400 hover:scale-110 hover:shadow-xl transition-all duration-200"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </motion.div>
    )}
  </div>
  


  );
};

export default Chatbot;
