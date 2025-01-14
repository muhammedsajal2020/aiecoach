import React, { useState } from 'react';
import { Search, ScanBarcode, Database, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: 'check' | 'scan' | 'upload') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleTabChange = (tab: 'check' | 'scan' | 'upload') => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <div className="bg-white shadow-md">
      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="https://aisats.in/images/Logo1.png" alt="Logo" className="h-8" />
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Collapsible Content */}
      <div
        className={`${
          isOpen ? 'max-h-96' : 'max-h-0'
        } overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 space-y-2 bg-gray-50">
          <button
            onClick={() => handleTabChange('check')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
              activeTab === 'check'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5 mr-3" />
            <span>Check Flight</span>
          </button>
          
          <button
            onClick={() => handleTabChange('scan')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
              activeTab === 'scan'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ScanBarcode className="w-5 h-5 mr-3" />
            <span>Scan QR</span>
          </button>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => handleTabChange('upload')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database className="w-5 h-5 mr-3" />
              <span>Data Management</span>
            </button>
          )}
          
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}