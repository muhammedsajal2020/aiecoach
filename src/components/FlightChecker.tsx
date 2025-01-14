import React, { useState, useEffect, useRef } from 'react';
import { Search, Plane, Save } from 'lucide-react';
import { FlightData } from '../types';
import { saveFlightRecord } from '../db';
import QRCode from 'qrcode';

// Predefined coach numbers
const coachNumbers = [
  'COACH-001', 'COACH-002', 'COACH-003', 'COACH-004', 'COACH-005',
  'COACH-006', 'COACH-007', 'COACH-008', 'COACH-009', 'COACH-010',
  'COACH-011', 'COACH-012', 'COACH-013', 'COACH-014', 'COACH-015'
];

export function FlightChecker() {
  const [flightNumber, setFlightNumber] = useState('');
  const [coachNumber, setCoachNumber] = useState('');
  const [coachSearch, setCoachSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCoaches, setFilteredCoaches] = useState(coachNumbers);
  const [result, setResult] = useState<{ found: boolean; type?: string; flightName?: string } | null>(null);
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('flightData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded flight data:', parsedData);
        setFlightData(parsedData);
      }
    } catch (error) {
      console.error('Error loading flight data:', error);
    }
  }, []);

  useEffect(() => {
    // Filter coach numbers based on search
    const filtered = coachNumbers.filter(coach => 
      coach.toLowerCase().includes(coachSearch.toLowerCase())
    );
    setFilteredCoaches(filtered);
  }, [coachSearch]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkFlight = () => {
    if (!flightData.length) {
      setResult({ found: false, type: 'No flight data available' });
      return;
    }

    const flight = flightData.find(
      (f) => f.flightNumber.toLowerCase() === flightNumber.toLowerCase()
    );

    console.log('Found flight:', flight);

    if (flight) {
      setResult({
        found: true,
        type: flight.type,
        flightName: flight.flightName
      });
    } else {
      setResult({ found: false });
    }
    setQrCode(null);
  };

  const generateQRCode = async (data: any) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!result?.found || !coachNumber) return;

    try {
      const flightDetails = {
        flightNumber,
        flightType: result.type!,
        flightName: result.flightName!,
        coachNumber,
        timestamp: new Date().toISOString(),
      };

      await saveFlightRecord(
        flightNumber,
        result.type!,
        result.flightName!,
        coachNumber
      );

      const qrDataUrl = await generateQRCode(flightDetails);
      if (qrDataUrl) {
        setQrCode(qrDataUrl);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      console.error('Error saving flight record:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <Plane className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Flight Type Checker</h2>
        </div>

        <div className="space-y-6">
          {!flightData.length && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">
                No flight data available. Please upload an Excel file in the Data Management section.
              </p>
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && checkFlight()}
              placeholder="Enter Flight Number (e.g., AI101)"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={checkFlight}
              disabled={!flightData.length}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Search size={20} />
            </button>
          </div>

          {result && (
            <div className="mt-6 animate-fade-in">
              {result.found ? (
                <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Flight Details</h3>
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <p className="text-lg flex items-center justify-between">
                        <span className="text-gray-600">Flight Number:</span>{' '}
                        <span className="font-semibold text-gray-800">{flightNumber}</span>
                      </p>
                      <p className="text-lg flex items-center justify-between">
                        <span className="text-gray-600">Type:</span>{' '}
                        <span className={`font-semibold ${
                          result.type === 'Domestic Arrival' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.type?.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-lg flex items-center justify-between">
                        <span className="text-gray-600">Flight Name:</span>{' '}
                        <span className="font-semibold text-gray-800">{result.flightName}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coach Number
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <input
                          type="text"
                          value={coachSearch}
                          onChange={(e) => {
                            setCoachSearch(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => setIsDropdownOpen(true)}
                          placeholder="Search coach number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {filteredCoaches.map((coach) => (
                              <button
                                key={coach}
                                onClick={() => {
                                  setCoachNumber(coach);
                                  setCoachSearch(coach);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                              >
                                {coach}
                              </button>
                            ))}
                            {filteredCoaches.length === 0 && (
                              <div className="px-4 py-2 text-gray-500">
                                No matches found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!coachNumber}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Save size={20} />
                      Save Details
                    </button>

                    {saveStatus === 'success' && (
                      <div className="mt-2 p-2 text-center text-green-600 bg-green-50 rounded-lg">
                        Flight details saved successfully!
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="mt-2 p-2 text-center text-red-600 bg-red-50 rounded-lg">
                        Error saving flight details. Please try again.
                      </div>
                    )}

                    {qrCode && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">QR Code</h4>
                        <div className="flex justify-center">
                          <img src={qrCode} alt="Flight Details QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-2">
                          Scan to view flight details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-red-600">
                    {result.type || 'Flight not found. Please check the flight number.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}