import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">
            JJUG CCC
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              ホーム
            </Link>
            <Link to="/chat" className="text-gray-600 hover:text-gray-900">
              チャット
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 