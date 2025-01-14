import React, { useEffect, useState } from 'react';
import { FlightChecker } from './components/FlightChecker';
import { AdminDataManagement } from './components/AdminDataManagement';
import { QRScanner } from './components/QRScanner';
import { X } from 'lucide-react';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = React.useState<'check' | 'upload' | 'scan'>('check');
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="animate-fade-in pt-8">
        {activeTab === 'check' ? (
          <FlightChecker />
        ) : activeTab === 'scan' ? (
          <QRScanner />
        ) : (
          <AdminDataManagement />
        )}
      </div>

      {showInstallPrompt && (
        <div className="pwa-install-prompt animate-slide-in">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold">Install Flight Checker</p>
              <p className="text-sm text-gray-600">Add to your home screen for quick access</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;