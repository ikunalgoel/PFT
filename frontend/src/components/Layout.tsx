import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    return isActive(path)
      ? `${base} bg-blue-700 text-white`
      : `${base} text-blue-100 hover:bg-blue-600 hover:text-white`;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-white text-lg sm:text-xl font-bold">
                  AI Finance Tracker
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link to="/" className={navLinkClass('/')}>
                  Dashboard
                </Link>
                <Link to="/transactions" className={navLinkClass('/transactions')}>
                  Transactions
                </Link>
                <Link to="/budgets" className={navLinkClass('/budgets')}>
                  Budgets
                </Link>
                <Link to="/settings" className={navLinkClass('/settings')}>
                  Settings
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              {user && (
                <>
                  {/* Desktop user menu */}
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-blue-100 text-sm truncate max-w-[200px]">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                  
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    {!isMobileMenuOpen ? (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`block ${navLinkClass('/')} w-full text-left`}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                onClick={closeMobileMenu}
                className={`block ${navLinkClass('/transactions')} w-full text-left`}
              >
                Transactions
              </Link>
              <Link
                to="/budgets"
                onClick={closeMobileMenu}
                className={`block ${navLinkClass('/budgets')} w-full text-left`}
              >
                Budgets
              </Link>
              <Link
                to="/settings"
                onClick={closeMobileMenu}
                className={`block ${navLinkClass('/settings')} w-full text-left`}
              >
                Settings
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-blue-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-blue-100 text-sm truncate">
                  {user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};
