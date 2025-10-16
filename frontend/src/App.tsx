import { useState, useEffect } from 'react';
import { TryOnCamera } from './components/TryOnCamera';
import './App.css';

function App() {
  const [jewelry, setJewelry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch jewelry from backend API
    fetch('http://localhost:8000/api/v1/jewelry')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jewelry');
        return res.json();
      })
      .then(data => {
        console.log('Fetched jewelry data:', data);
        if (data.items && data.items.length > 0) {
          setJewelry(data.items[0]); // Use first jewelry item
        } else {
          setError('No jewelry items found. Please create one via the API.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading jewelry...</p>
        </div>
      </div>
    );
  }

  if (error || !jewelry) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center text-white max-w-md p-8 bg-white/10 rounded-2xl backdrop-blur-lg">
          <h2 className="text-2xl font-bold mb-4">⚠️ No Jewelry Found</h2>
          <p className="mb-6">{error || 'No jewelry items in database'}</p>
          <div className="bg-black/30 p-4 rounded-lg text-left text-sm font-mono">
            <p className="mb-2">Create a jewelry item:</p>
            <code className="text-green-400">
              curl -X POST http://localhost:8000/api/v1/jewelry \<br/>
              &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
              &nbsp;&nbsp;-d '{`{...jewelry data...}`}'
            </code>
          </div>
        </div>
      </div>
    );
  }

  return <TryOnCamera jewelry={jewelry} />;
}

export default App;