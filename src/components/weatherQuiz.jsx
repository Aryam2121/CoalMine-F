import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Confetti from "react-confetti"; // Import Confetti for achievement celebration
import { FaRegClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const triviaCategories = {
  Weather: [
    {
      question: "What is the hottest temperature ever recorded on Earth?",
      options: ["56.7°C", "50.3°C", "45.0°C", "40.1°C"],
      answer: "56.7°C",
      hint: "It's over 50°C.",
      difficulty: "Medium",
    },
    {
      question: "Which is the driest place on Earth?",
      options: ["Atacama Desert", "Sahara Desert", "Arctic", "Antarctica"],
      answer: "Atacama Desert",
      hint: "Located in South America.",
      difficulty: "Easy",
    },
    {
      question: "What is the standard unit for measuring temperature?",
      options: ["Celsius", "Fahrenheit", "Kelvin", "All of the above"],
      answer: "All of the above",
      hint: "More than one correct option.",
      difficulty: "Hard",
    },
    {
      question: "What is the largest storm system ever recorded on Earth?",
      options: ["Hurricane Patricia", "Typhoon Tip", "Cyclone Winston", "Hurricane Irma"],
      answer: "Typhoon Tip",
      hint: "It occurred in the Western Pacific in 1979.",
      difficulty: "Hard",
    },
    {
      question: "Which of these cities is known for having the highest annual average rainfall?",
      options: ["Seattle", "Singapore", "New Orleans", "Mawsynram"],
      answer: "Mawsynram",
      hint: "It's located in India and is often called the wettest place on Earth.",
      difficulty: "Medium",
    },
    {
      question: "What weather phenomenon is responsible for creating tornadoes?",
      options: ["Thunderstorms", "Hurricanes", "Blizzards", "Droughts"],
      answer: "Thunderstorms",
      hint: "Typically forms in severe thunderstorms, especially in the Great Plains.",
      difficulty: "Medium",
    },
    {
      question: "What is the main cause of the greenhouse effect?",
      options: ["CO2 emissions", "Ozone depletion", "Deforestation", "Excessive rainfall"],
      answer: "CO2 emissions",
      hint: "It's the burning of fossil fuels that release carbon dioxide into the atmosphere.",
      difficulty: "Easy",
    },
    {
      question: "What is the coldest temperature ever recorded on Earth?",
      options: ["-89.2°C", "-100°C", "-79.5°C", "-72.3°C"],
      answer: "-89.2°C",
      hint: "This temperature was recorded in Antarctica.",
      difficulty: "Hard",
    },
    {
      question: "Which weather phenomenon is characterized by sudden, strong winds that form over the ocean?",
      options: ["Hurricanes", "Monsoons", "Tornadoes", "Heatwaves"],
      answer: "Hurricanes",
      hint: "They form over warm ocean waters and can cause widespread damage.",
      difficulty: "Medium",
    },
    {
      question: "Which of these is a direct consequence of climate change?",
      options: ["Rising sea levels", "Increased volcanic activity", "More frequent meteor showers", "Stronger earthquakes"],
      answer: "Rising sea levels",
      hint: "The melting of polar ice caps is a major factor.",
      difficulty: "Easy",
    },
  ],
};
const WeatherTrivia = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timer, setTimer] = useState(20);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [badges, setBadges] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti animation
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Timer logic
  useEffect(() => {
    if (timer > 0 && !answered && isTimerActive) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0 && !answered) {
      toast.warn("Time's up!");
      setAnswered(true);
    }
  }, [timer, answered, isTimerActive]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    const filteredQuestions = triviaCategories[category].filter(
      (q) => q.difficulty === difficulty
    );
    setQuestions(filteredQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimer(20);
    setHintsUsed(0);
    setBadges([]);
    setShowConfetti(false); // Reset confetti when restarting
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    if (answer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
      toast.success("Correct Answer!");
      unlockBadge("First Correct Answer");
    } else {
      toast.error("Wrong Answer!");
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setAnswered(false);
      setSelectedAnswer("");
      setTimer(20);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
    } else {
      unlockBadge("Quiz Completed");
      toast.info(`Quiz Over! Your Score: ${score}/${questions.length}`);
      restartGame();
    }
  };

  const unlockBadge = (badgeName) => {
    if (!badges.includes(badgeName)) {
      setBadges([...badges, badgeName]);
      toast.success(`Achievement Unlocked: ${badgeName}`);
      setShowConfetti(true); // Trigger confetti when unlocking a badge
    }
  };

  const restartGame = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer("");
    setTimer(20);
    setShowHint(false);
    setHintsUsed(0);
    setIsTimerActive(true); // Reset timer state
  };

  const handleHint = () => {
    if (hintsUsed < maxHints) {
      setShowHint(true);
      setHintsUsed(hintsUsed + 1);
    } else {
      toast.error("No more hints available!");
    }
  };

  return (
    <div className="weather-trivia w-full h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 relative overflow-hidden transition-all duration-500">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        run={showConfetti}
        numberOfPieces={200}
        gravity={0.2}
        recycle={false}
      />
      <div
        className={`weather-trivia-content p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto mt-8 relative z-10 bg-white dark:bg-gray-800 ${
          answered ? "animate-fade-in" : "animate-slide-up"
        } transition-all duration-500`}
      >
        {!selectedCategory ? (
          <div className="category-selection text-center space-y-6">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-700 mb-6">
              Select Category
            </h2>
            {Object.keys(triviaCategories).map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className="w-full py-5 mb-4 bg-blue-600 text-white text-2xl rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {category}
              </button>
            ))}
            <div className="difficulty mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-blue-900">Select Difficulty:</h3>
              <div className="flex justify-center gap-6">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-8 py-4 rounded-lg text-white font-medium ${
                      difficulty === level
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="quiz space-y-8">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-blue-800">{selectedCategory} Trivia</h2>
            <div className="time-bar">
              <div className="progress-bar bg-gray-200 rounded-full w-full h-2 mb-4">
                <div
                  className="progress bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{ width: `${(timer / 20) * 100}%` }}
                ></div>
              </div>
              <p className="text-right text-red-500 font-semibold text-xl">Time Left: {timer}s</p>
            </div>
            <p className="text-2xl mb-4 text-blue-900">{questions[currentQuestionIndex].question}</p>
            {showHint && (
              <p className="text-sm italic text-yellow-300 mb-4">{`Hint: ${questions[currentQuestionIndex].hint}`}</p>
            )}
            <div className="options space-y-4">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`py-4 px-6 w-full text-xl rounded-xl transition-all duration-300 transform ${
                    selectedAnswer === option
                      ? selectedAnswer === questions[currentQuestionIndex].answer
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  disabled={answered}
                >
                  {selectedAnswer === option && selectedAnswer === questions[currentQuestionIndex].answer && (
                    <FaCheckCircle className="inline-block mr-2 text-white" />
                  )}
                  {selectedAnswer === option && selectedAnswer !== questions[currentQuestionIndex].answer && (
                    <FaTimesCircle className="inline-block mr-2 text-white" />
                  )}
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={handleHint}
                className={`bg-yellow-500 px-8 py-4 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 transform ${
                  hintsUsed >= maxHints ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Hint ({maxHints - hintsUsed} left)
              </button>
              {answered && (
                <button
                  onClick={nextQuestion}
                  className="bg-blue-500 px-8 py-4 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 transform"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default WeatherTrivia;