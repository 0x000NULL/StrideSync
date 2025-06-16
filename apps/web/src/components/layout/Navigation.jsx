import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navigation = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  // Navigation items
  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/runs', label: 'Runs' },
  ];

  const userMenu = [
    { to: '/profile', label: 'Profile' },
    { to: '/settings', label: 'Settings' },
  ];

  // Mobile menu item class
  const mobileItemClass = (to) =>
    `${
      location.pathname === to
        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`;

  // Desktop menu item class
  const desktopItemClass = (to) =>
    `${
      location.pathname === to
        ? 'border-indigo-500 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`;

  return (
    <>
      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.to}`}
              to={item.to}
              className={mobileItemClass(item.to)}
              onClick={onClose}
            >
              {getIcon(item.icon)}
              {item.label}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-4">
            <div className="text-sm font-medium text-gray-500">Account</div>
          </div>
          <div className="mt-3 space-y-1">
            <Link
              to="/profile"
              className="group flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={onClose}
            >
              <span className="truncate">Your Profile</span>
            </Link>
            <Link
              to="/settings"
              className="group flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={onClose}
            >
              <span className="truncate">Settings</span>
            </Link>
            <button
              onClick={() => {
                const { logout } = useAuth();
                logout();
                if (onClose) onClose();
              }}
              className="group w-full flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-left"
            >
              <span className="truncate">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:ml-10 md:flex md:space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={desktopItemClass(item.to)}
            aria-current={isActive(item.to) ? 'page' : undefined}
          >
            {item.label}
            {isActive(item.to) && (
              <span className="absolute inset-x-1 -bottom-1 h-0.5 bg-indigo-600" />
            )}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navigation;
