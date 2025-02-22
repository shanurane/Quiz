import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { sampleQuestions } from "../data";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(sampleQuestions[0].timeLimit);
  const [showResults, setShowResults] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [ans, setans] = useState("");

  useEffect(() => {
    localforage.getItem("quizAttempts").then((history) => {
      if (history) setAttemptHistory(history);
    });
  }, []);

  useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, showResults]);

  const handleChange = (e) => {
    setans(e.target.value);
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(handleNextQuestion, 500);
    setans("");
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(sampleQuestions[currentQuestion + 1].timeLimit);
      setSelectedAnswer(null);
    } else {
      const attempt = {
        score,
        total: sampleQuestions.length,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [attempt, ...attemptHistory];
      setAttemptHistory(newHistory);
      localforage.setItem("quizAttempts", newHistory);
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        <p className="text-lg mb-4">
          Score: {score}/{sampleQuestions.length}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Attempt History</h3>
        <ul>
          {attemptHistory.map((attempt, index) => (
            <li key={index} className="mb-2 p-2 bg-gray-100 rounded">
              {new Date(attempt.timestamp).toLocaleString()} - {attempt.score}/
              {attempt.total}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const currentQ = sampleQuestions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <span className="font-semibold">
          Question {currentQuestion + 1} of {sampleQuestions.length}
        </span>
        <span className="font-semibold">Time left: {timeLeft}s</span>
      </div>

      <h2 className="text-xl font-bold mb-4">{currentQ.question}</h2>

      <div className="space-y-3">
        {currentQ.type === "mcq" ? (
          currentQ.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`w-full p-3 text-left rounded-lg transition-colors
              ${
                selectedAnswer !== null
                  ? option === currentQ.correctAnswer
                    ? "bg-green-200"
                    : "bg-red-200"
                  : "bg-gray-100 hover:bg-blue-100"
              }
              ${selectedAnswer === option ? "ring-2 ring-blue-500" : ""}`}
            >
              {option}
            </button>
          ))
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={ans}
              onChange={handleChange}
              className="p-2 border border-black rounded-lg"
            />
            <button
              onClick={() => handleAnswer(ans)}
              disabled={ans.length <= 0}
              className={`w-full p-3 text-left rounded-lg transition-colors bg-sky-400 disabled:bg-sky-200 disabled:cursor-not-allowed`}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
