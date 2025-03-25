// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// // Custom components
// import ProgressBar from "./ProgressBar"; // A reusable ProgressBar component

// const achievementsList = [
//   {
//     id: 1,
//     name: "Checked Weather 7 Days in a Row",
//     description: "Check the weather every day for 7 days.",
//     target: 7,
//     progressKey: "weatherCheckStreak",
//     milestone: "Streak 7 Days",
//   },
//   {
//     id: 2,
//     name: "Logged 3 Cities",
//     description: "Log weather data for 3 different cities.",
//     target: 3,
//     progressKey: "loggedCities",
//   },
//   {
//     id: 3,
//     name: "Shared the App",
//     description: "Share the app with a friend.",
//     target: 1,
//     progressKey: "sharedApp",
//   },
//   {
//     id: 4,
//     name: "Check Weather for 30 Days",
//     description: "Check the weather every day for 30 days.",
//     target: 30,
//     progressKey: "weatherCheck30Days",
//     milestone: "Streak 30 Days",
//   },
// ];

// const Achievements = () => {
//   const [completedAchievements, setCompletedAchievements] = useState([]);
//   const [userProgress, setUserProgress] = useState({
//     weatherCheckStreak: 0,
//     loggedCities: 0,
//     sharedApp: 0,
//     weatherCheck30Days: 0,
//   });
//   const [dailyStreak, setDailyStreak] = useState(0);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeModalTab, setActiveModalTab] = useState("Details");
//   const [achievements, setAchievements] = useState(achievementsList);

//   useEffect(() => {
//     const savedAchievements = JSON.parse(localStorage.getItem("achievements")) || [];
//     setCompletedAchievements(savedAchievements);

//     const savedProgress = JSON.parse(localStorage.getItem("userProgress")) || userProgress;
//     setUserProgress(savedProgress);

//     const savedStreak = localStorage.getItem("dailyStreak") || 0;
//     setDailyStreak(parseInt(savedStreak));

//     const savedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
//     setLeaderboard(savedLeaderboard);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("achievements", JSON.stringify(completedAchievements));
//     localStorage.setItem("userProgress", JSON.stringify(userProgress));
//     localStorage.setItem("dailyStreak", dailyStreak);
//     localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
//   }, [completedAchievements, userProgress, dailyStreak, leaderboard]);

//   const filteredAchievements = achievements.filter((achievement) => {
//     if (activeFilter === "Completed") {
//       return userProgress[achievement.progressKey] >= achievement.target;
//     }
//     if (activeFilter === "In-Progress") {
//       return userProgress[achievement.progressKey] < achievement.target;
//     }
//     return true; // For "All"
//   });

//   useEffect(() => {
//     const fetchAchievements = async () => {
//       try {
//         const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/getAchieve`);
//         const data = await response.json();
//         if (data.success) setAchievements(data.data);
//       } catch (error) {
//         toast.error("Failed to load achievements");
//       }
//     };

//     fetchAchievements();
//   }, []);

//   const handleAchievementCompletion = async (achievementId, progressKey, target) => {
//     if (userProgress[progressKey] >= target) return;
  
//     try {
//       const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/${achievementId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ [progressKey]: userProgress[progressKey] + 1 }),
//       });
  
//       if (response.ok) {
//         const updatedProgress = { ...userProgress, [progressKey]: userProgress[progressKey] + 1 };
//         setUserProgress(updatedProgress);
  
//         if (updatedProgress[progressKey] === target) {
//           setCompletedAchievements([...completedAchievements, achievementId]);
//           toast.success(`Achievement unlocked: ${achievements.find(a => a._id === achievementId)?.name}`);
//         }
  
//         if (progressKey === "weatherCheckStreak") {
//           setDailyStreak(dailyStreak + 1);
//         }
  
//         setLeaderboard([...leaderboard, { username: "User", achievements: completedAchievements.length + 1 }]);
//       }
//     } catch (error) {
//       toast.error("Failed to update achievement");
//     }
//   };
  
//   const deleteAchievement = async (achievementId) => {
//     try {
//       const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/${achievementId}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         setAchievements(achievements.filter((ach) => ach.id !== achievementId));
//         toast.success("Achievement deleted!");
//       }
//     } catch (error) {
//       toast.error("Failed to delete achievement");
//     }
//   };

//   return (
//     <div className="achievements bg-gradient-to-b from-gray-900 to-black w-full min-h-screen text-gray-200 px-6 py-10">
//       <h2 className="text-5xl font-extrabold mb-10 text-center text-white">Achievements</h2>

//       <div className="filters flex justify-center mb-8 space-x-4">
//         {["All", "Completed", "In-Progress"].map((filter) => (
//           <button
//             key={filter}
//             onClick={() => setActiveFilter(filter)}
//             className={`px-4 py-2 rounded-full transition font-medium ${
//               activeFilter === filter ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//             }`}
//           >
//             {filter}
//           </button>
//         ))}
//       </div>

//       <div className="achievement-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredAchievements.map((achievement) => (
//           <div key={achievement.id} className="p-6 rounded-xl shadow-lg bg-gray-800 text-gray-200">
//             <h3 className="text-2xl font-semibold mb-2">{achievement.name}</h3>
//             <p className="text-sm mb-4">{achievement.description}</p>

//             <ProgressBar progress={userProgress[achievement.progressKey]} target={achievement.target} />
//             <button
//   onClick={() => handleAchievementCompletion(achievement._id, achievement.progressKey, achievement.target)}
//   className="mt-4 w-full px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
// >
//   {completedAchievements.includes(achievement._id) ? "Achieved" : "Complete"}
// </button>


// <button onClick={() => deleteAchievement(achievement._id)} className="mt-2 w-full px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition">
//   Delete
// </button>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Achievements;
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar"; // A reusable ProgressBar component

const Achievements = () => {
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [dailyStreak, setDailyStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/getAchieve`);
        const data = await response.json();
        if (data.success) setAchievements(data.data);
      } catch (error) {
        toast.error("Failed to load achievements");
      }
    };

    fetchAchievements();
  }, []);
  const handleAchievementCompletion = async (achievementId, progressKey, target) => {
    if (!progressKey || userProgress[progressKey] >= target) return;
  
    try {
      const updatedValue = (userProgress[progressKey] || 0) + 1;
  
      console.log("🔹 Sending Update Request:");
      console.log("Achievement ID:", achievementId);
      console.log("Payload:", { progressKey, progress: updatedValue });
  
      // Ensure correct API URL
      const apiUrl = `https://${import.meta.env.VITE_BACKEND}/api/achievements/${achievementId}`;
      console.log("✅ Corrected API URL:", apiUrl);
  
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressKey, progress: updatedValue }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("🚨 API Response Error:", errorData);
        throw new Error(errorData.error || "Failed to update achievement");
      }
  
      console.log("✅ Achievement Updated Successfully");
  
      // Update local state
      setUserProgress((prev) => ({
        ...prev,
        [progressKey]: updatedValue,
      }));
  
      if (updatedValue === target) {
        setCompletedAchievements((prev) => [...prev, achievementId]);
        toast.success(`Achievement unlocked: ${achievements.find((a) => a._id === achievementId)?.name}`);
      }
  
    } catch (error) {
      console.error("🚨 Achievement Update Error:", error);
      toast.error(`Failed to update achievement: ${error.message}`);
    }
  };
  
  
  
  const deleteAchievement = async (achievementId) => {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_BACKEND}/api/${achievementId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAchievements(achievements.filter((ach) => ach._id !== achievementId));
        toast.success("Achievement deleted!");
      }
    } catch (error) {
      toast.error("Failed to delete achievement");
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeFilter === "Completed") {
      return userProgress[achievement.progressKey] >= achievement.target;
    }
    if (activeFilter === "In-Progress") {
      return userProgress[achievement.progressKey] < achievement.target;
    }
    return true;
  });

  return (
    <div className="achievements bg-gradient-to-b from-gray-900 to-black w-full min-h-screen text-gray-200 px-8 py-12">
      {/* Heading */}
      <h2 className="text-6xl font-extrabold mb-12 text-center text-white tracking-wide drop-shadow-lg">
        🎖 Achievements Unlocked
      </h2>

      {/* Filter Buttons */}
      <div className="filters flex justify-center mb-10 space-x-6">
        {["All", "Completed", "In-Progress"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-200 
              ${
                activeFilter === filter
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement._id}
            className={`p-8 rounded-3xl bg-gray-800/90 backdrop-blur-lg text-gray-200 shadow-xl relative transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/40 
              ${
                completedAchievements.includes(achievement._id)
                  ? "border-4 border-blue-500 shadow-blue-500/50"
                  : ""
              }`}
          >
            {/* Achievement Title */}
            <h3 className="text-3xl font-bold mb-3 text-white tracking-wide drop-shadow-lg">
              {achievement.name}
            </h3>
            <p className="text-lg mb-5 text-gray-300 leading-relaxed">{achievement.description}</p>

            {/* Custom Progress Bar */}
            <div className="relative w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out rounded-full"
                style={{
                  width: `${(userProgress[achievement.progressKey] || 0) / achievement.target * 100}%`,
                }}
              ></div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col space-y-4">
              <button
                onClick={() => handleAchievementCompletion(achievement._id, achievement.progressKey, achievement.target)}
                className={`w-full py-3 rounded-xl text-xl font-semibold tracking-wide shadow-lg transition-all duration-200 
                  ${
                    completedAchievements.includes(achievement._id)
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                  }`}
              >
                {completedAchievements.includes(achievement._id) ? "🏆 Achieved" : "Complete"}
              </button>

              <button
                onClick={() => deleteAchievement(achievement._id)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xl font-semibold shadow-md transition-all"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;