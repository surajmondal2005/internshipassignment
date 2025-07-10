import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { CheckCircleIcon, XCircleIcon, CameraIcon, VideoCameraIcon, PhotoIcon, UserGroupIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

function FeedbackBadge({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {feedback.map((msg, idx) => {
        const isGood = msg.toLowerCase().includes("good");
        return (
          <span
            key={idx}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-md transition-all duration-300
              ${isGood
                ? "bg-green-400/80 text-green-900 animate-bounce"
                : "bg-red-400/80 text-red-900 animate-pulse"
              }
            `}
          >
            {isGood ? (
              <CheckCircleIcon className="w-4 h-4 text-green-700" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-700" />
            )}
            {msg}
          </span>
        );
      })}
    </div>
  );
}

function HomeScreen({ onSelect }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200 flex flex-col items-center justify-center py-6 px-2 font-sans">
      <div className="w-full max-w-md glassmorphism-card shadow-2xl rounded-3xl p-8 animate-fade-in flex flex-col gap-8">
        <h1 className="text-3xl font-extrabold text-center text-indigo-900 drop-shadow-lg mb-2 tracking-tight">
          Welcome to Posture Detection
        </h1>
        <p className="text-center text-gray-600 mb-4">Choose a detection mode:</p>
        <div className="flex flex-col gap-6">
          <button
            onClick={() => onSelect("squat")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold text-lg shadow-xl hover:scale-105 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 active:scale-95 active:shadow-inner focus:outline-none"
          >
            <CameraIcon className="w-10 h-10 text-white drop-shadow-lg" />
            Squat Detection
          </button>
          <button
            onClick={() => onSelect("desk")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-lg shadow-xl hover:scale-105 hover:from-pink-500 hover:to-purple-500 transition-all duration-200 active:scale-95 active:shadow-inner focus:outline-none"
          >
            <UserGroupIcon className="w-10 h-10 text-white drop-shadow-lg" />
            Desk Sitting Detection
          </button>
        </div>
      </div>
      <style>{`
        .glassmorphism-card {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 mb-4 text-indigo-700 font-bold hover:underline focus:outline-none"
    >
      <ArrowLeftIcon className="w-5 h-5" /> Back to Home
    </button>
  );
}

function DeskDetection({ onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFeedback, setVideoFeedback] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Webcam state
  const webcamRef = useRef(null);
  const [webcamFeedback, setWebcamFeedback] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamLoading, setWebcamLoading] = useState(false);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("https://internshipassignment-1.onrender.com/analyze_desk", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      setFeedback({ error: "Failed to connect to backend." });
    }
    setLoading(false);
  };

  // Video handlers
  const handleVideoChange = (e) => {
    setSelectedVideo(e.target.files[0]);
    setVideoFeedback(null);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideo) return;
    setVideoLoading(true);
    setVideoFeedback(null);

    const formData = new FormData();
    formData.append("video", selectedVideo);

    try {
      const response = await fetch("https://internshipassignment-1.onrender.com/analyze_desk_video", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setVideoFeedback(data);
    } catch (error) {
      setVideoFeedback({ error: "Failed to connect to backend." });
    }
    setVideoLoading(false);
  };

  // Webcam real-time detection
  useEffect(() => {
    let interval;
    if (webcamActive && webcamRef.current) {
      interval = setInterval(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        setWebcamLoading(true);
        // Convert base64 to blob
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("image", blob, "webcam.jpg");
        try {
          const response = await fetch("https://internshipassignment-1.onrender.com/analyze_desk", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setWebcamFeedback(data);
        } catch (error) {
          setWebcamFeedback({ error: "Failed to connect to backend." });
        }
        setWebcamLoading(false);
      }, 1000); // 1 second interval
    }
    return () => clearInterval(interval);
  }, [webcamActive]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200 flex flex-col items-center py-6 px-2 font-sans">
      <div className="w-full max-w-md glassmorphism-card shadow-2xl rounded-3xl p-6 mb-8 mt-4 animate-fade-in">
        <BackButton onClick={onBack} />
        <h2 className="text-2xl font-bold text-center mb-2 text-indigo-900 drop-shadow-lg">Desk Sitting Detection</h2>
        <p className="text-center text-gray-600 mb-4">Upload an image, video, or use your camera for real-time desk posture feedback!</p>
        {/* Image upload */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
            <PhotoIcon className="w-5 h-5 text-blue-400" />
            Image Upload
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 active:scale-95 active:shadow-inner" disabled={loading}>
            {loading ? "Analyzing..." : "Upload & Analyze Image"}
          </button>
        </form>
        {selectedImage && (
          <div className="mb-4 flex justify-center">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-blue-200"
            />
          </div>
        )}
        {feedback && (
          <div className="bg-white/80 rounded-xl p-4 shadow-lg mb-6 animate-fade-in">
            {feedback.error ? (
              <div className="text-red-600 font-semibold">{feedback.error}</div>
            ) : (
              <>
                <div className="flex gap-4 mb-2">
                  <span className="font-semibold text-blue-900">Shoulder Angle:</span> <span>{feedback.shoulder_angle}</span>
                  <span className="font-semibold text-blue-900">Neck Angle:</span> <span>{feedback.neck_angle}</span>
                </div>
                <FeedbackBadge feedback={feedback.feedback} />
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
          <span className="mx-3 text-gray-400 font-bold">OR</span>
          <div className="flex-grow h-px bg-gradient-to-l from-blue-200 via-purple-200 to-pink-200"></div>
        </div>

        {/* Video upload */}
        <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center gap-1">
          <VideoCameraIcon className="w-5 h-5 text-purple-400" />
          Video Desk Posture Detection
        </h3>
        <form onSubmit={handleVideoSubmit} className="mb-6 flex flex-col gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
          />
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 active:scale-95 active:shadow-inner" disabled={videoLoading}>
            {videoLoading ? "Analyzing..." : "Upload & Analyze Video"}
          </button>
        </form>
        {selectedVideo && (
          <div className="mb-4 flex justify-center">
            <video
              src={URL.createObjectURL(selectedVideo)}
              controls
              className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-purple-200"
            />
          </div>
        )}
        {videoFeedback && (
          <div className="bg-white/80 rounded-xl p-4 shadow-lg mb-6 animate-fade-in">
            {videoFeedback.error ? (
              <div className="text-red-600 font-semibold">{videoFeedback.error}</div>
            ) : (
              <>
                <div className="font-semibold text-purple-900 mb-2">Summary:</div>
                <ul className="mb-2 text-sm">
                  <li>Total Frames: {videoFeedback.summary.total_frames}</li>
                  <li>Analyzed Frames: {videoFeedback.summary.analyzed_frames}</li>
                  <li>Bad Posture Frames: {videoFeedback.summary.bad_posture_frames}</li>
                  <li>Bad Posture %: {videoFeedback.summary.bad_posture_percentage}</li>
                </ul>
                <div className="max-h-40 overflow-y-auto mt-2">
                  <b className="text-purple-700">Per-frame Feedback:</b>
                  <ul className="text-xs">
                    {videoFeedback.frames.map((frame, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">Frame {frame.frame}:</span> [Shoulder: {frame.shoulder_angle}, Neck: {frame.neck_angle}] -
                        <FeedbackBadge feedback={frame.feedback} />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200"></div>
          <span className="mx-3 text-gray-400 font-bold">OR</span>
          <div className="flex-grow h-px bg-gradient-to-l from-pink-200 via-purple-200 to-blue-200"></div>
        </div>

        {/* Webcam real-time desk detection */}
        <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-1">
          <CameraIcon className="w-5 h-5 text-blue-400" />
          Webcam Real-Time Desk Detection
        </h3>
        <div className="mb-4">
          <button
            onClick={() => setWebcamActive((prev) => !prev)}
            className={`w-full py-2 px-4 rounded-xl font-bold shadow-lg transition-all duration-200 mb-4
              ${webcamActive ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white scale-95" : "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 hover:scale-105"}
            `}
          >
            {webcamActive ? "Stop Webcam" : "Start Webcam"}
          </button>
          {webcamActive && (
            <>
              <div className="flex justify-center mb-2">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={320}
                  videoConstraints={{ facingMode: "user" }}
                  className="rounded-xl shadow-xl border-2 border-blue-200"
                />
              </div>
              <div className="text-center text-sm text-blue-700 min-h-[24px] mb-2">
                {webcamLoading ? "Analyzing..." : null}
              </div>
              {webcamFeedback && (
                <div className="bg-white/80 rounded-xl p-4 shadow-lg animate-fade-in">
                  {webcamFeedback.error ? (
                    <div className="text-red-600 font-semibold">{webcamFeedback.error}</div>
                  ) : (
                    <>
                      <div className="flex gap-4 mb-2">
                        <span className="font-semibold text-blue-900">Shoulder Angle:</span> <span>{webcamFeedback.shoulder_angle}</span>
                        <span className="font-semibold text-blue-900">Neck Angle:</span> <span>{webcamFeedback.neck_angle}</span>
                      </div>
                      <FeedbackBadge feedback={webcamFeedback.feedback} />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Glassmorphism effect and fade-in animation */}
      <style>{`
        .glassmorphism-card {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFeedback, setVideoFeedback] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Webcam state
  const webcamRef = useRef(null);
  const [webcamFeedback, setWebcamFeedback] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamLoading, setWebcamLoading] = useState(false);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("https://internshipassignment-1.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      setFeedback({ error: "Failed to connect to backend." });
    }
    setLoading(false);
  };

  // Video handlers
  const handleVideoChange = (e) => {
    setSelectedVideo(e.target.files[0]);
    setVideoFeedback(null);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideo) return;
    setVideoLoading(true);
    setVideoFeedback(null);

    const formData = new FormData();
    formData.append("video", selectedVideo);

    try {
      const response = await fetch("https://internshipassignment-1.onrender.com/analyze_video", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setVideoFeedback(data);
    } catch (error) {
      setVideoFeedback({ error: "Failed to connect to backend." });
    }
    setVideoLoading(false);
  };

  // Webcam real-time detection
  useEffect(() => {
    let interval;
    if (webcamActive && webcamRef.current) {
      interval = setInterval(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        setWebcamLoading(true);
        // Convert base64 to blob
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("image", blob, "webcam.jpg");
        try {
          const response = await fetch("https://internshipassignment-1.onrender.com/analyze", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setWebcamFeedback(data);
        } catch (error) {
          setWebcamFeedback({ error: "Failed to connect to backend." });
        }
        setWebcamLoading(false);
      }, 1000); // 1 second interval
    }
    return () => clearInterval(interval);
  }, [webcamActive]);

  // --- UI Routing ---
  if (screen === "home") {
    return <HomeScreen onSelect={setScreen} />;
  }

  if (screen === "desk") {
    return <DeskDetection onBack={() => setScreen("home")} />;
  }

  // --- Squat Detection UI ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200 flex flex-col items-center py-6 px-2 font-sans">
      <div className="w-full max-w-md glassmorphism-card shadow-2xl rounded-3xl p-6 mb-8 mt-4 animate-fade-in">
        <BackButton onClick={() => setScreen("home")} />
        <h2 className="text-3xl font-extrabold text-center mb-2 text-indigo-900 drop-shadow-lg tracking-tight">
          <span className="inline-flex items-center gap-2">
            <CameraIcon className="w-7 h-7 text-indigo-500" />
            Squat Posture Detection
          </span>
        </h2>
        <p className="text-center text-gray-600 mb-4">Upload an image, video, or use your camera for real-time feedback!</p>
        {/* Image upload */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
            <PhotoIcon className="w-5 h-5 text-blue-400" />
            Image Upload
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 active:scale-95 active:shadow-inner" disabled={loading}>
            {loading ? "Analyzing..." : "Upload & Analyze Image"}
          </button>
        </form>
        {selectedImage && (
          <div className="mb-4 flex justify-center">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-blue-200"
            />
          </div>
        )}
        {feedback && (
          <div className="bg-white/80 rounded-xl p-4 shadow-lg mb-6 animate-fade-in">
            {feedback.error ? (
              <div className="text-red-600 font-semibold">{feedback.error}</div>
            ) : (
              <>
                <div className="flex gap-4 mb-2">
                  <span className="font-semibold text-blue-900">Knee Angle:</span> <span>{feedback.knee_angle}</span>
                  <span className="font-semibold text-blue-900">Back Angle:</span> <span>{feedback.back_angle}</span>
                </div>
                <FeedbackBadge feedback={feedback.feedback} />
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
          <span className="mx-3 text-gray-400 font-bold">OR</span>
          <div className="flex-grow h-px bg-gradient-to-l from-blue-200 via-purple-200 to-pink-200"></div>
        </div>

        {/* Video upload */}
        <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center gap-1">
          <VideoCameraIcon className="w-5 h-5 text-purple-400" />
          Video Squat Form Detection
        </h3>
        <form onSubmit={handleVideoSubmit} className="mb-6 flex flex-col gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
          />
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 active:scale-95 active:shadow-inner" disabled={videoLoading}>
            {videoLoading ? "Analyzing..." : "Upload & Analyze Video"}
          </button>
        </form>
        {selectedVideo && (
          <div className="mb-4 flex justify-center">
            <video
              src={URL.createObjectURL(selectedVideo)}
              controls
              className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-purple-200"
            />
          </div>
        )}
        {videoFeedback && (
          <div className="bg-white/80 rounded-xl p-4 shadow-lg mb-6 animate-fade-in">
            {videoFeedback.error ? (
              <div className="text-red-600 font-semibold">{videoFeedback.error}</div>
            ) : (
              <>
                <div className="font-semibold text-purple-900 mb-2">Summary:</div>
                <ul className="mb-2 text-sm">
                  <li>Total Frames: {videoFeedback.summary.total_frames}</li>
                  <li>Analyzed Frames: {videoFeedback.summary.analyzed_frames}</li>
                  <li>Bad Posture Frames: {videoFeedback.summary.bad_posture_frames}</li>
                  <li>Bad Posture %: {videoFeedback.summary.bad_posture_percentage}</li>
                </ul>
                <div className="max-h-40 overflow-y-auto mt-2">
                  <b className="text-purple-700">Per-frame Feedback:</b>
                  <ul className="text-xs">
                    {videoFeedback.frames.map((frame, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">Frame {frame.frame}:</span> [Knee: {frame.knee_angle}, Back: {frame.back_angle}] -
                        <FeedbackBadge feedback={frame.feedback} />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200"></div>
          <span className="mx-3 text-gray-400 font-bold">OR</span>
          <div className="flex-grow h-px bg-gradient-to-l from-pink-200 via-purple-200 to-blue-200"></div>
        </div>

        {/* Webcam real-time squat detection */}
        <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-1">
          <CameraIcon className="w-5 h-5 text-blue-400" />
          Webcam Real-Time Squat Detection
        </h3>
        <div className="mb-4">
          <button
            onClick={() => setWebcamActive((prev) => !prev)}
            className={`w-full py-2 px-4 rounded-xl font-bold shadow-lg transition-all duration-200 mb-4
              ${webcamActive ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white scale-95" : "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 hover:scale-105"}
            `}
          >
            {webcamActive ? "Stop Webcam" : "Start Webcam"}
          </button>
          {webcamActive && (
            <>
              <div className="flex justify-center mb-2">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={320}
                  videoConstraints={{ facingMode: "user" }}
                  className="rounded-xl shadow-xl border-2 border-blue-200"
                />
              </div>
              <div className="text-center text-sm text-blue-700 min-h-[24px] mb-2">
                {webcamLoading ? "Analyzing..." : null}
              </div>
              {webcamFeedback && (
                <div className="bg-white/80 rounded-xl p-4 shadow-lg animate-fade-in">
                  {webcamFeedback.error ? (
                    <div className="text-red-600 font-semibold">{webcamFeedback.error}</div>
                  ) : (
                    <>
                      <div className="flex gap-4 mb-2">
                        <span className="font-semibold text-blue-900">Knee Angle:</span> <span>{webcamFeedback.knee_angle}</span>
                        <span className="font-semibold text-blue-900">Back Angle:</span> <span>{webcamFeedback.back_angle}</span>
                      </div>
                      <FeedbackBadge feedback={webcamFeedback.feedback} />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Glassmorphism effect and fade-in animation */}
      <style>{`
        .glassmorphism-card {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;
