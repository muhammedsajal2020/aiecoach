import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanBarcode, X } from 'lucide-react';

interface ScanResult {
  flightNumber: string;
  flightType: string;
  flightName: string;
  coachNumber: string;
  timestamp: string;
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const startScanning = () => {
    setScanning(true);
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText: string) {
      try {
        const data = JSON.parse(decodedText) as ScanResult;
        setResult(data);
        scanner.clear();
        setScanning(false);
      } catch (error) {
        console.error('Error parsing QR code data:', error);
      }
    }

    function onScanError(error: any) {
      console.warn(`QR code scan error: ${error}`);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(false);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <ScanBarcode className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">QR Code Scanner</h2>
        </div>

        {!scanning && !result && (
          <button
            onClick={startScanning}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ScanBarcode className="w-5 h-5" />
            Start Scanning
          </button>
        )}

        <div id="qr-reader" className={scanning ? 'mt-6' : 'hidden'} />

        {result && (
          <div className="mt-6 animate-fade-in">
            <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Flight Details</h3>
                <button
                  onClick={resetScanner}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Flight Number:</span>
                  <span className="font-semibold">{result.flightNumber}</span>
                </p>
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Flight Name:</span>
                  <span className="font-semibold">{result.flightName}</span>
                </p>
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Type:</span>
                  <span className={`font-semibold ${
                    result.flightType === 'domestic' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {result.flightType.toUpperCase()}
                  </span>
                </p>
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Coach Number:</span>
                  <span className="font-semibold">{result.coachNumber}</span>
                </p>
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Scanned On:</span>
                  <span className="font-semibold">{formatDate(result.timestamp)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}