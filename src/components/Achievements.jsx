import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Custom components
import ProgressBar from "./ProgressBar";  // A reusable ProgressBar component

const achievementsList = [
  {
    id: 1,
    name: "Checked Weather 7 Days in a Row",
    description: "Check the weather every day for 7 days.",
    target: 7,
    progressKey: "weatherCheckStreak",
    milestone: "Streak 7 Days",
  },
  {
    id: 2,
    name: "Logged 3 Cities",
    description: "Log weather data for 3 different cities.",
    target: 3,
    progressKey: "loggedCities",
  },
  {
    id: 3,
    name: "Shared the App",
    description: "Share the app with a friend.",
    target: 1,
    progressKey: "sharedApp",
  },
  {
    id: 4,
    name: "Check Weather for 30 Days",
    description: "Check the weather every day for 30 days.",
    target: 30,
    progressKey: "weatherCheck30Days",
    milestone: "Streak 30 Days",
  },
];

const Achievements = () => {
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState({
    weatherCheckStreak: 0,
    loggedCities: 0,
    sharedApp: 0,
    weatherCheck30Days: 0,
  });
  const [dailyStreak, setDailyStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalTab, setActiveModalTab] = useState("Details");
  useEffect(() => {
    const savedAchievements = JSON.parse(localStorage.getItem("achievements")) || [];
    setCompletedAchievements(savedAchievements);
    
    const savedProgress = JSON.parse(localStorage.getItem("userProgress")) || userProgress;
    setUserProgress(savedProgress);

    const savedStreak = localStorage.getItem("dailyStreak") || 0;
    setDailyStreak(parseInt(savedStreak));

    const savedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(savedLeaderboard);
  }, []);
  const filteredAchievements = achievementsList.filter((achievement) => {
    if (activeFilter === "Completed") {
      return userProgress[achievement.progressKey] >= achievement.target;
    }
    if (activeFilter === "In-Progress") {
      return userProgress[achievement.progressKey] < achievement.target;
    }
    return true; // For "All"
  });

  useEffect(() => {
    localStorage.setItem("achievements", JSON.stringify(completedAchievements));
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
    localStorage.setItem("dailyStreak", dailyStreak);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }, [completedAchievements, userProgress, dailyStreak, leaderboard]);

  const handleAchievementCompletion = (achievementId, progressKey, milestone) => {
    if (!completedAchievements.includes(achievementId)) {
      const newAchievements = [...completedAchievements, achievementId];
      setCompletedAchievements(newAchievements);
      toast.success("Achievement Unlocked!");
    }

    const newProgress = { ...userProgress, [progressKey]: userProgress[progressKey] + 1 };
    setUserProgress(newProgress);

    if (milestone && newProgress[progressKey] === 7) {
      toast.info(`Milestone Unlocked: ${milestone}!`);
    }

    if (progressKey === "weatherCheckStreak") {
      const newStreak = dailyStreak + 1;
      setDailyStreak(newStreak);
    }

    const updatedLeaderboard = [...leaderboard, { username: "User", achievements: newAchievements }];
    setLeaderboard(updatedLeaderboard);
  };

  const renderProgressBar = (progress, target) => {
    return <ProgressBar progress={progress} target={target} />;
  };

  const toggleModal = (content) => {
    setModalContent(content);
    setShowModal(!showModal);
  };

  return (
    <div className="achievements bg-gradient-to-b from-gray-900 to-black w-full min-h-screen text-gray-200 px-6 py-10">
      {/* Title */}
      <h2 className="text-5xl font-extrabold mb-10 text-center text-white">
        Achievements
      </h2>
  
      {/* Filters */}
      <div className="filters flex justify-center mb-8 space-x-4">
        {["All", "Completed", "In-Progress"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full transition font-medium ${
              activeFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
  
      {/* Search Bar */}
      <div className="search mb-10 flex justify-center">
        <input
          type="text"
          placeholder="Search Achievements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg px-4 py-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
  
      {/* Achievements List */}
      <div className="achievement-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-6 rounded-xl shadow-lg transform transition-all hover:scale-105 ${
              completedAchievements.includes(achievement.id)
                ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200"
            }`}
          >
            <h3 className="text-2xl font-semibold mb-2">{achievement.name}</h3>
            <p className="text-sm mb-4">{achievement.description}</p>
  
            {/* Animated Progress Bar */}
            {renderProgressBar(userProgress[achievement.progressKey], achievement.target)}
  
            <button
              onClick={() =>
                handleAchievementCompletion(achievement.id, achievement.progressKey, achievement.milestone)
              }
              className={`mt-4 w-full px-6 py-2 rounded-lg text-center transition ease-in-out ${
                completedAchievements.includes(achievement.id)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={`${
                completedAchievements.includes(achievement.id)
                  ? "This achievement is completed."
                  : "Complete this achievement."
              }`}
            >
              {completedAchievements.includes(achievement.id) ? "Achieved" : "Complete"}
            </button>
  
            <div className="mt-2 text-sm">
              <span
                onClick={() => toggleModal(achievement.description)}
                className="cursor-pointer text-blue-400 hover:text-blue-600 hover:underline"
              >
                More Info
              </span>
            </div>
          </div>
        ))}
      </div>
  
      {/* Leaderboard Section */}
      <div className="mt-12">
        <h3 className="text-4xl font-semibold text-center text-white">Leaderboard</h3>
        <div className="leaderboard mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`leaderboard-entry p-6 rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-purple-800 text-gray-200 hover:scale-105 transition-transform relative`}
            >
              <p className="text-lg font-semibold">{entry.username}</p>
              <p className="text-sm text-gray-300">Achievements: {entry.achievements.length}</p>
  
              {/* Ranking Badge */}
              {index < 3 && (
                <span
                  className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-full ${
                    index === 0
                      ? "bg-yellow-400 text-black"
                      : index === 1
                      ? "bg-gray-400 text-black"
                      : "bg-orange-400 text-black"
                  }`}
                >
                  {["Gold", "Silver", "Bronze"][index]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
  
      {/* Daily Streak */}
      <div className="mt-12 text-center">
        <h3 className="text-4xl font-semibold text-white">Daily Streak</h3>
        <p className="text-lg text-gray-400 mt-2">Current Streak: {dailyStreak} days</p>
      </div>
  
      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl max-w-md w-full text-gray-200">
            <h4 className="text-2xl font-bold mb-4">Achievement Details</h4>
  
            {/* Tabs for Modal */}
            <div className="tabs mb-4 flex space-x-4 border-b border-gray-600 pb-2">
              {["Details", "Progress Insights"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveModalTab(tab)}
                  className={`px-4 py-2 font-medium ${
                    activeModalTab === tab
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
  
            {activeModalTab === "Details" && <p>{modalContent}</p>}
            {activeModalTab === "Progress Insights" && (
              <div>
                <p>Progress Chart Coming Soon...</p>
              </div>
            )}
  
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
