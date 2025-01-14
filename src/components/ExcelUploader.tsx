import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { FlightData } from '../types';

export function ExcelUploader() {
  const [flightData, setFlightData] = useState<FlightData[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('flightData');
    if (savedData) {
      setFlightData(JSON.parse(savedData));
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as FlightData[];
        
        setFlightData(jsonData);
        localStorage.setItem('flightData', JSON.stringify(jsonData));
      } catch (error) {
        console.error('Error processing Excel file:', error);
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const clearData = () => {
    localStorage.removeItem('flightData');
    setFlightData([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Flight Data Management</h2>
          {flightData.length > 0 && (
            <button
              onClick={clearData}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </button>
          )}
        </div>

        {uploading && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-600">Processing Excel file...</p>
          </div>
        )}

        {flightData.length === 0 ? (
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-500" />
                <p className="mb-2 text-xl text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <FileCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-600">
                  {flightData.length} flights loaded successfully
                </p>
                <p className="text-sm text-green-500">
                  Data is saved locally and will be available on refresh
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Upload New Data</h3>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Choose new Excel file</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">Excel file format requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>flightNumber (e.g., AI101)</li>
            <li>type (domestic or international)</li>
            <li>flightName (e.g., Air India Express)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}