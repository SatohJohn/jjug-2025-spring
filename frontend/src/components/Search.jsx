import React, { useState } from 'react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.text();
      setResult(data);
    } catch (error) {
      console.error('検索エラー:', error);
      setResult('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating) => {
    try {
      const response = await fetch('/api/search/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          rating: rating
        })
      });
      const result = await response.text();
      if (result.startsWith('Error:')) {
        alert('評価の送信に失敗しました: ' + result);
      } else {
        alert('評価ありがとうございます！');
      }
    } catch (error) {
      console.error('評価エラー:', error);
      alert('評価の送信に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div style={{ width: '100%', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">検索</h1>
            <div className="flex gap-4 mb-8">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="検索キーワードを入力..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                検索
              </button>
            </div>
            {result && (
              <div className="mt-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleRating(1)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    良い 👍
                  </button>
                  <button
                    onClick={() => handleRating(0)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    悪い 👎
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 