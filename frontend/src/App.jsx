import React from 'react';
import { createRouter, RouterProvider, createRootRoute, createRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Link } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import Chat from './components/Chat';
import Search from './components/Search';
import { useBooleanFlagValue } from '@openfeature/react-sdk';

// ページコンポーネント
const Home = () => {
  const flag = useBooleanFlagValue('file-attachment', false)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">ようこそ！</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              このアプリケーションは、最新のWeb技術を活用したモダンなUIを提供します。
              React、Tailwind CSS、TanStack Routerを使用して構築されています。
              {flag ? 'true' : 'false'}
            </p>
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

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: Chat,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  chatRoute,
]);

// ルーターの作成
const router = createRouter({ routeTree });

// クエリクライアントの作成
const queryClient = new QueryClient();

// ナビゲーションコンポーネント
const Navigation = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="w-full px-4">
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
              to="/chat"
              className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              チャット
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
