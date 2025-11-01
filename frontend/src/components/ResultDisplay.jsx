import { useState, useCallback, memo } from 'react';

function ResultDisplay({ result, jewelry, onReset, onTryAnother }) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Memoize callbacks to prevent re-creation on every render
  const downloadImage = useCallback(async () => {
    try {
      const response = await fetch(result.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jewelry-tryon-${jewelry.name.replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Try right-click and save image.');
    }
  }, [result.image_url, jewelry.name]);

  const shareToSocial = useCallback((platform) => {
    const text = `Check out how ${jewelry.name} looks on me! 💎`;
    const url = result.image_url;

    const links = {
      tiktok: `https://www.tiktok.com/upload`,
      instagram: `https://www.instagram.com/`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    if (links[platform]) {
      window.open(links[platform], '_blank');
    }
  }, [jewelry.name, result.image_url]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(result.image_url);
    alert('Link copied to clipboard!');
  }, [result.image_url]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">✨ Stunning! ✨</h2>
          <p className="text-purple-100">
            Here's how <strong>{jewelry.name}</strong> looks on you
          </p>
        </div>

        {/* Result Image */}
        <div className="p-6">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={result.image_url}
              alt="Try-on result"
              className="w-full h-auto"
            />
          </div>

          {/* Metadata */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Processed by {result.metadata?.provider || 'AI'} in{' '}
              {Math.round(result.metadata?.processingTime / 1000) || 3}s
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
              Cost: ${result.cost?.toFixed(3) || '0.055'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadImage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <span>⬇️</span> Download
            </button>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <span>📤</span> Share
            </button>
          </div>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">Share to:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => shareToSocial('tiktok')}
                  className="bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  TikTok
                </button>
                <button
                  onClick={() => shareToSocial('instagram')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  Instagram
                </button>
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  Facebook
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  Twitter
                </button>
                <button
                  onClick={copyLink}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-sm transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onTryAnother}
              className="bg-white hover:bg-gray-100 border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold transition"
            >
              🔄 Try Another
            </button>
            <button
              onClick={onReset}
              className="bg-white hover:bg-gray-100 border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold transition"
            >
              📸 New Photo
            </button>
          </div>
        </div>

        {/* Jewelry Info */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-t border-gray-200">
          <h3 className="font-bold text-xl mb-3">{jewelry.name}</h3>
          {jewelry.description && (
            <p className="text-gray-600 mb-3">{jewelry.description}</p>
          )}
          {jewelry.price && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  Rs. {jewelry.price.amount?.toLocaleString()}
                </p>
                {jewelry.price.compare_at_amount && (
                  <p className="text-sm text-gray-500 line-through">
                    Rs. {jewelry.price.compare_at_amount.toLocaleString()}
                  </p>
                )}
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition">
                Buy Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(ResultDisplay);
