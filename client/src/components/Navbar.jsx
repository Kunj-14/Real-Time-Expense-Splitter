import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600 font-bold text-xl gap-2 hover:text-primary-700 transition">
              <Home size={24} />
              Expense Splitter
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium hidden sm:block">
              {user?.username}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
