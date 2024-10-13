import React from 'react';
import { AlertCircle, Info, AlertTriangle, Bug, Glasses, CircleHelp, Skull } from 'lucide-react';

const getLevelStyle = (level) => {
  switch(level) {
    case 'TRACE': return 'bg-purple-900 text-purple-200';
    case 'DEBUG': return 'bg-green-900 text-green-200';
    case 'INFO': return 'bg-blue-900 text-blue-200';
    case 'WARNING': return 'bg-yellow-900 text-yellow-200';
    case 'ERROR': return 'bg-red-900 text-red-200';
    case 'FATAL': return 'bg-red-950 text-red-100';
    default: return 'bg-gray-700 text-gray-200';
  }
};

const getLogIcon = (level) => {
  switch(level) {
    case 'TRACE': return <Glasses className="text-purple-400" size={16} />;
    case 'DEBUG': return <Bug className="text-green-400" size={16} />;
    case 'INFO': return <Info className="text-blue-400" size={16} />;
    case 'WARNING': return <AlertTriangle className="text-yellow-400" size={16} />;
    case 'ERROR': return <AlertCircle className="text-red-400" size={16} />;
    case 'FATAL': return <Skull className="text-red-100" size={16} />;
    default: return <CircleHelp className="text-gray-200" size={16} />;
  }
};

const LogRow = ({ log, index, isSelected, onClick, onContextMenu }) => {
  return (
    <tr 
      className={`cursor-pointer transition-colors duration-150 ease-in-out select-none
        ${isSelected 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : index % 2 === 0 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-gray-750 hover:bg-gray-700'}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap w-1/6">{log.timestamp == 'UNKNOWN' ? '-' : log.timestamp}</td>
      
        <td className="px-4 py-4 whitespace-nowrap w-1/12">
        {log.level != 'UNKNOWN' && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelStyle(log.level)}`}>
            {getLogIcon(log.level)}
            <span className="ml-1">{log.level ? log.level.toUpperCase() : 'UNKNOWN'}</span>
          </span>
      )}
        </td>
      <td className="px-4 py-4 text-sm text-gray-300">{log.message}</td>
    </tr>
  );
};

export default React.memo(LogRow);