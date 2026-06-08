import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import { LogoIcon } from '../icons/LogoIcon'; // Asegúrate de que esta ruta sea correcta

// Auxiliary component for navigation links (defined outside to avoid unnecessary re-renders)
const NavLinkItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-slate-800 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white font-bold text-xl flex items-center group">
              {/* Logo icon extracted to its own component */}
              <LogoIcon className="mr-2 text-sky-400 group-hover:text-sky-300 transition-colors" />
              SmartTicket-AI
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {isAuthenticated && (
                  <>
                    <NavLinkItem to="/">My Tickets</NavLinkItem>
                    {isAdmin && <NavLinkItem to="/admin">Admin</NavLinkItem>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User Area / Auth */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 text-sm hidden sm:block">Welcome, {user?.name}</span>
                <Button onClick={logout} variant="secondary" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;