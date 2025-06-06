import React from 'react';
import { createRouter, RouterProvider, createRootRoute, createRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Link } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';

// ページコンポーネント
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">ようこそ！</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            このアプリケーションは、最新のWeb技術を活用したモダンなUIを提供します。
            React、Tailwind CSS、TanStack Routerを使用して構築されています。
          </p>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const [query, setQuery] = React.useState('');
  const [result, setResult] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">検索</h1>
          <div className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="検索クエリを入力..."
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>
          {result && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">検索結果:</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About</h1>
          <div className="prose prose-lg">
            <p className="text-gray-600 leading-relaxed">
              このアプリケーションは、最新のWeb技術を活用したモダンなUIを提供します。
              主な特徴は以下の通りです：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li>React 19による高速なUIレンダリング</li>
              <li>Tailwind CSSによる美しいデザイン</li>
              <li>TanStack Routerによる堅牢なルーティング</li>
              <li>React Queryによる効率的なデータフェッチング</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ルート定義
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: Search,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  aboutRoute,
]);

// ルーターの作成
const router = createRouter({ routeTree });

// クエリクライアントの作成
const queryClient = new QueryClient();

// ナビゲーションコンポーネント
const Navigation = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              to="/"
              className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              ホーム
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              検索
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// メインアプリケーションコンポーネント
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
