import { useState, useRef, useCallback, memo } from 'react';
import Webcam from 'react-webcam';

function PhotoCapture({ onCapture }) {
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [preview, setPreview] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Memoize callbacks to prevent re-creation on every render
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
    }
  }, []);

  const confirmPhoto = useCallback(() => {
    if (preview) {
      onCapture(preview);
    }
  }, [preview, onCapture]);

  const retake = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => {
            setMode('upload');
            retake();
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            mode === 'upload'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📁 Upload Photo
        </button>
        <button
          onClick={() => {
            setMode('camera');
            retake();
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            mode === 'camera'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📸 Use Camera
        </button>
      </div>

      {/* Camera/Upload Area */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {!preview ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {mode === 'camera' ? (
              <div className="w-full h-full relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.92}
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: 'user',
                    width: 1280,
                    height: 720,
                  }}
                  mirrored={true}
                />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-full font-semibold shadow-lg transition"
                >
                  📸 Capture Photo
                </button>
              </div>
            ) : (
              <div className="text-center p-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-6xl">📁</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-700 mb-2">
                    Click to upload photo
                  </span>
                  <span className="text-gray-500 text-sm">
                    PNG, JPG up to 10MB
                  </span>
                </label>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto"
            />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={retake}
                className="bg-white hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition"
              >
                🔄 Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition"
              >
                ✓ Use This Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-semibold mb-2">💡 Tips for best results:</p>
        <ul className="text-sm text-blue-700 space-y-1 ml-4">
          <li>• Good lighting is essential</li>
          <li>• Hold your hand/face clearly visible</li>
          <li>• Avoid blurry or dark photos</li>
          <li>• Face the camera directly</li>
        </ul>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(PhotoCapture);
