import { useState } from 'react';
import PhotoCapture from '../components/PhotoCapture';
import JewelrySelector from '../components/JewelrySelector';
import ResultDisplay from '../components/ResultDisplay';

const API_BASE = 'http://localhost:8000/api/v1';

export default function TryOnPage() {
  const [step, setStep] = useState(1); // 1: Photo, 2: Select, 3: Processing, 4: Result
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedJewelry, setSelectedJewelry] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoCapture = (photo) => {
    setUserPhoto(photo);
    setStep(2);
    setError(null);
  };

  const handleJewelrySelect = async (jewelry) => {
    setSelectedJewelry(jewelry);
    setStep(3);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_photo: userPhoto,
          jewelry_id: jewelry.item_id,
          options: {
            strength: 0.75,
            steps: 28,
            guidance: 3.5,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStep(4);
      } else {
        setError(data.error || 'AI processing failed. Please try again.');
        setStep(2);
      }
    } catch (err) {
      console.error('Try-on error:', err);
      setError('Network error. Make sure backend is running and API key is set.');
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep(1);
    setUserPhoto(null);
    setSelectedJewelry(null);
    setResult(null);
    setError(null);
  };

  const tryAnother = () => {
    setStep(2);
    setSelectedJewelry(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Jewelry AR Try-On
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            See how stunning jewelry looks on you with AI magic ✨
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 md:gap-4">
            {[
              { num: 1, label: 'Photo', icon: '📸' },
              { num: 2, label: 'Select', icon: '💎' },
              { num: 3, label: 'AI Magic', icon: '✨' },
              { num: 4, label: 'Result', icon: '🎉' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg
                    transition-all duration-300
                    ${
                      step > s.num
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-100'
                        : step === s.num
                        ? 'bg-purple-200 text-purple-700 scale-110 shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                  >
                    {step > s.num ? '✓' : s.icon}
                  </div>
                  <span className={`text-xs md:text-sm mt-2 font-semibold ${step === s.num ? 'text-purple-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`w-12 md:w-16 h-1 mx-1 md:mx-2 transition-all duration-300 ${
                      step > s.num ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Photo Capture */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl">
              <h2 className="text-3xl font-bold mb-3 text-center">
                📸 Step 1: Take Your Photo
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Show your hand, face, or where you want to wear jewelry
              </p>
              <PhotoCapture onCapture={handlePhotoCapture} />
            </div>
          )}

          {/* Step 2: Jewelry Selection */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl">
              <h2 className="text-3xl font-bold mb-3 text-center">
                💎 Step 2: Choose Your Jewelry
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Select any piece to see how it looks on you
              </p>
              <JewelrySelector onSelect={handleJewelrySelect} userPhoto={userPhoto} />
              <div className="mt-8 text-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
                >
                  ← Change Photo
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && isProcessing && (
            <div className="bg-white rounded-2xl p-12 md:p-20 shadow-xl text-center">
              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {/* Spinning rings */}
                  <div className="absolute inset-0 border-8 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-t-8 border-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-t-8 border-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    ✨
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-4">Creating Magic...</h2>
                <p className="text-gray-600 text-xl mb-2">
                  Our AI is carefully placing <strong>{selectedJewelry?.name}</strong> on your photo
                </p>
                <p className="text-gray-500 text-sm">
                  This usually takes 3-5 seconds
                </p>
              </div>

              {/* Processing Steps */}
              <div className="flex gap-6 justify-center items-center text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                  Analyzing
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  Placing
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  Perfecting
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && result && (
            <ResultDisplay
              result={result}
              jewelry={selectedJewelry}
              onReset={reset}
              onTryAnother={tryAnother}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by AI • Made with 💜 in Nepal</p>
        </div>
      </div>
    </div>
  );
}
