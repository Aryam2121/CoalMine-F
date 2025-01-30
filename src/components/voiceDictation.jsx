import React, { useState, useEffect, useRef } from "react";

// Check if the browser supports the Web Speech API
const isSpeechRecognitionAvailable = () => {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
};

const VoiceDictation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (isSpeechRecognitionAvailable()) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.continuous = true;

      // Handle speech results
      recognitionRef.current.onresult = (event) => {
        let newTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript((prev) => prev + newTranscript);
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        setError(`Error: ${event.error}`);
      };
    } else {
      setError("Speech Recognition API is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Start or stop the voice recognition
  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    }
  };

  // Pause recognition without resetting transcript
  const pauseRecognition = () => {
    if (!recognitionRef.current || !isRecording) return;
    recognitionRef.current.stop();
    setIsPaused(true);
    setIsRecording(false);
  };

  // Resume recognition
  const resumeRecognition = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    setIsPaused(false);
    setIsRecording(true);
  };

  // Copy transcript to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    alert("Transcript copied to clipboard!");
  };

  // Auto-scroll transcript when it updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
        Voice Dictation
      </h1>

      {/* Error Message */}
      {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}

      <div className="text-center mb-4">
        {isRecording ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            <p className="text-red-500 font-semibold">Recording...</p>
          </div>
        ) : (
          <p className="text-gray-600">Press the button to start dictating.</p>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 text-white font-bold rounded-full shadow-lg transition duration-300 ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isRecording ? "Stop" : "Start"}
        </button>

        {isRecording && (
          <button
            onClick={pauseRecognition}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg transition duration-300"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={resumeRecognition}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg transition duration-300"
          >
            Resume
          </button>
        )}
      </div>

      {/* Transcription Output */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Transcription:</h3>
        <div
          ref={transcriptRef}
          className="h-40 overflow-y-auto border p-2 rounded bg-gray-100 text-gray-800 text-sm"
        >
          {transcript || <span className="text-gray-500">Your speech will appear here...</span>}
        </div>
      </div>

      {/* Copy Button */}
      {transcript && (
        <div className="mt-4 text-center">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-full shadow-lg transition duration-300"
          >
            Copy Transcript
          </button>
        </div>
      )}

      {/* Footer Information */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Speech is transcribed in real-time. If you face issues, try speaking clearly and adjusting your environment.
        </p>
      </div>
    </div>
  );
};

export default VoiceDictation;
