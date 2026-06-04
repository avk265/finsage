import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Type, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const AutoCategorization = () => {
  const [mode, setMode] = useState(null);
  const [inputText, setInputText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const userGmail = localStorage.getItem("loggedIngmail") || ""; // <-- fetch logged-in user's email

  // Initialize SpeechRecognition
  if (
    typeof window !== "undefined" &&
    recognitionRef.current === null &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  ) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setError("");
      setLoading(true);

      try {
        const res = await fetch("http://localhost:3000/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gmail: userGmail, content: text }), // <-- send Gmail & content
        });
        const data = await res.json();

        if (data.success) {
          setCategory(data.category);
          setItem(data.item || "");
          setAmount(data.amount || "");
          setPayment(data.payment || "");
        } else {
          setError(`Categorization failed: ${data.message}`);
          resetOutput();
        }
      } catch {
        setError("Server connection error");
      } finally {
        setLoading(false);
        setRecording(false);
      }
    };

    recognitionRef.current.onerror = (event) => {
      const messages = {
        network: "Network issue: cannot reach speech service.",
        "not-allowed": "Microphone access denied.",
        "no-speech": "No speech detected.",
      };
      setError(messages[event.error] || `Error: ${event.error}`);
      setRecording(false);
      setLoading(false);
    };

    recognitionRef.current.onend = () => setRecording(false);
  }

  const resetOutput = () => {
    setCategory("");
    setItem("");
    setAmount("");
    setPayment("");
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError("SpeechRecognition not supported in this browser.");
      return;
    }
    setError("");
    resetOutput();
    setTranscript("");
    setLoading(true);
    setRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setRecording(false);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError("");
    setTranscript(inputText);

    try {
      const res = await fetch("http://localhost:3000/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: userGmail, content: inputText }), // <-- send Gmail & content
      });
      const data = await res.json();

      if (data.success) {
        setCategory(data.category);
        setItem(data.item || "");
        setAmount(data.amount || "");
        setPayment(data.payment || "");
      } else {
        setError(`Categorization failed: ${data.message}`);
        resetOutput();
      }
    } catch {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex justify-center items-center p-6">
      <motion.div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Expense Auto-Categorization
        </h2>

        {/* Mode Selection */}
        {!mode && (
          <motion.div
            className="flex flex-col gap-5 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-700 font-medium">Choose Input Mode</p>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("text")}
                className="bg-white border-2 border-blue-500 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-all duration-300"
              >
                <Type /> Text
              </button>
              <button
                onClick={() => setMode("voice")}
                className="bg-white border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl hover:bg-green-600 hover:text-white flex items-center gap-2 transition-all duration-300"
              >
                <Mic /> Voice
              </button>
            </div>
          </motion.div>
        )}

        {/* Input Mode Active */}
        <AnimatePresence>
          {mode === "text" && (
            <motion.div
              key="text-mode"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mt-4"
            >
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your expense description..."
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              {/* Format disclaimer */}
              <p className="text-xs text-gray-500 italic mt-2">
                Please enter your expense in natural language including amount, item/category, and payment mode if possible. Example: "Spent 500 on groceries using UPI"
              </p>
              <button
                onClick={handleTextSubmit}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 transition-all"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? "Processing..." : "Categorize"}
              </button>
            </motion.div>
          )}

          {mode === "voice" && (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mt-4 text-center"
            >
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-lg text-white font-semibold flex justify-center items-center gap-3 transition-all ${
                  recording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {recording ? <MicOff /> : <Mic />}
                {recording ? "Stop Recording" : "Start Voice Input"}
              </button>
              {/* Format disclaimer */}
              <p className="text-xs text-gray-500 italic mt-2 max-w-xs mx-auto">
                Please speak clearly describing amount, item/category, and payment method if possible. Example: "Paid 200 for lunch with GPay"
              </p>
              {loading && !recording && (
                <p className="mt-3 text-gray-600 flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" /> Processing...
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {(transcript || error) && (
          <motion.div
            className="bg-blue-50 border border-blue-200 p-5 rounded-xl shadow-inner mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {transcript && (
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Transcript:</strong> {transcript}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <p><strong>Category:</strong> {category || "-"}</p>
                  <p><strong>Item:</strong> {item || "-"}</p>
                  <p><strong>Amount:</strong> {amount || "-"}</p>
                  <p><strong>Payment:</strong> {payment || "-"}</p>
                </div>
                {category && (
                  <div className="mt-3 flex items-center text-green-600 gap-2">
                    <CheckCircle2 /> Successfully categorized!
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="mt-4 text-red-600 flex items-center gap-2">
                <AlertTriangle /> <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}

        {mode && (
          <button
            onClick={() => setMode(null)}
            className="mt-6 w-full border border-gray-400 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
          >
            Back to Mode Selection
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default AutoCategorization;
