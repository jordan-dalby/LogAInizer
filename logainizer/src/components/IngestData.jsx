import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

const IngestData = ({ onDataReceived }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [pastedLogs, setPastedLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handlePastedLogsChange = (event) => {
    setPastedLogs(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (activeTab === 'upload') {
      if (!file) {
        setError('Please select a file');
        setIsLoading(false);
        return;
      }
      formData.append('file', file);
    } else {
      if (!pastedLogs.trim()) {
        setError('Please paste some logs');
        setIsLoading(false);
        return;
      }
      formData.append('logs', pastedLogs);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/analyse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload data');
      }

      const data = await response.json();
      onDataReceived(data.logs);
    } catch (error) {
      setError('Error uploading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 px-4 ${activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} rounded-l-lg focus:outline-none transition-colors duration-150`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={16} className="inline-block mr-2" />
          Upload File
        </button>
        <button
          className={`flex-1 py-2 px-4 ${activeTab === 'paste' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} rounded-r-lg focus:outline-none transition-colors duration-150`}
          onClick={() => setActiveTab('paste')}
        >
          <FileText size={16} className="inline-block mr-2" />
          Paste Logs
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {activeTab === 'upload' ? (
          <div className="mb-4">
            <label htmlFor="file-upload" className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
              <span className="flex items-center space-x-2">
                <Upload size={24} className="text-gray-400" />
                <span className="font-medium text-gray-300">
                  {file ? file.name : "Drop files to Attach, or Browse"}
                </span>
              </span>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <textarea
            value={pastedLogs}
            onChange={handlePastedLogsChange}
            className="mb-4 p-2 bg-gray-700 text-white rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your logs here..."
          />
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-150"
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default IngestData;