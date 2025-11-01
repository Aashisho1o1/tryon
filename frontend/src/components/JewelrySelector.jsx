import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api/v1';

export default function JewelrySelector({ onSelect, userPhoto }) {
  const [jewelry, setJewelry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJewelry();
  }, [filter]);

  const fetchJewelry = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? `${API_BASE}/jewelry?page_size=20`
        : `${API_BASE}/jewelry?type=${filter}&page_size=20`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setJewelry(data.items);
      } else {
        setError('Failed to load jewelry');
      }
    } catch (err) {
      setError('Network error. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = ['all', 'ring', 'earrings', 'necklace', 'bracelet'];

  return (
    <div className="w-full">
      {/* Type Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              filter === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? '✨ All' : `${getEmoji(type)} ${capitalize(type)}`}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">⚠️ {error}</p>
          <button
            onClick={fetchJewelry}
            className="mt-2 text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            Try Again →
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64"></div>
          ))}
        </div>
      ) : jewelry.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-gray-600">No jewelry found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try a different filter or add some jewelry items
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {jewelry.map((item) => (
            <div
              key={item.item_id}
              onClick={() => onSelect(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer group overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
                {item.images?.main ? (
                  <img
                    src={item.images.main}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                ) : (
                  <span className="text-6xl">{getEmoji(item.type)}</span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm transition">
                    Try On
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                {item.price && (
                  <p className="text-lg font-bold text-purple-600 mt-2">
                    Rs. {item.price.amount?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Indicator */}
      {userPhoto && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
          <img src={userPhoto} alt="Your photo" className="w-12 h-12 rounded object-cover" />
          <span className="text-sm text-gray-600">Your photo ready</span>
        </div>
      )}
    </div>
  );
}

function getEmoji(type) {
  const emojis = {
    ring: '💍',
    earrings: '👂',
    necklace: '📿',
    bracelet: '⌚',
  };
  return emojis[type] || '💎';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
