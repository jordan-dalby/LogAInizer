import React, { useState } from 'react';
import LogViewer from './components/LogViewer';
import IngestData from './components/IngestData';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './main.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [isIngestOpen, setIsIngestOpen] = useState(true);

  const handleDataReceived = (newLogs) => {
    setLogs(newLogs);
    setIsIngestOpen(false);
  };

  const toggleIngest = () => {
    setIsIngestOpen(!isIngestOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 p-4">
      <div className="flex-shrink-0">
        <h1 className="text-4xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Log Viewer Dashboard
        </h1>
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-4">
          <div
            className="flex justify-between items-center p-4 cursor-pointer bg-gray-700 hover:bg-gray-650 transition-colors duration-150"
            onClick={toggleIngest}
          >
            <h2 className="text-xl font-semibold text-gray-200">Ingest Data</h2>
            {isIngestOpen ? (
              <ChevronUp className="text-gray-400" size={24} />
            ) : (
              <ChevronDown className="text-gray-400" size={24} />
            )}
          </div>
          {isIngestOpen && <IngestData onDataReceived={handleDataReceived} />}
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {logs.length > 0 ? (
          <LogViewer logs={logs} />
        ) : (
          <div className="h-full flex items-center justify-center text-center text-gray-400">
            <p className="text-xl">No logs available. Please ingest data to view logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;