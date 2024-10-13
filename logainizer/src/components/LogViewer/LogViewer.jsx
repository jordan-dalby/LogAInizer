import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Minus, Search } from 'lucide-react';
import ContextMenu from './ContextMenu';
import LogRow from './LogRow';
import { useSearch } from './SearchSelected';

const LogViewer = ({ logs }) => {
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState(new Set(['TRACE', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'FATAL', 'UNKNOWN']));
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [initialSelectionIndex, setInitialSelectionIndex] = useState(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', or 'desc'
  const tableRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const logLevels = useMemo(() => ['TRACE', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'FATAL', 'UNKNOWN'], []);

  const { isLoading, error, handleSearchClick } = useSearch({
    onDataReceived: (searchedLogs) => {
      onLogsUpdate(searchedLogs);
    },
  });

  useEffect(() => {
    let filtered = logs.filter(log => 
      selectedLevels.has(log.level) &&
      ((log.message ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase()) ||
       log.timestamp.includes(searchTerm))
    );

    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        const timestampA = a.timestamp ?? '';
        const timestampB = b.timestamp ?? '';
        const compareResult = timestampA.localeCompare(timestampB);
        return sortOrder === 'asc' ? compareResult : -compareResult;
      });
    }

    setFilteredLogs(filtered);
    setSelectedIndices(new Set());
    setInitialSelectionIndex(null);
  }, [logs, searchTerm, selectedLevels, sortOrder]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setIsShiftPressed(e.shiftKey);
      setIsCtrlPressed(e.ctrlKey || e.metaKey);
    };
    const handleKeyUp = () => {
      setIsShiftPressed(false);
      setIsCtrlPressed(false);
    };
    const handleClickOutside = (e) => {
      if (contextMenu && !tableRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (scrollContainerRef.current) {
        const containerHeight = scrollContainerRef.current.offsetHeight;
        const headerHeight = scrollContainerRef.current.querySelector('thead').offsetHeight;
        const scrollBodyHeight = containerHeight - headerHeight;
        const scrollBody = scrollContainerRef.current.querySelector('.scroll-body');
        if (scrollBody) {
          scrollBody.style.height = `${scrollBodyHeight}px`;
        }
      }
    });

    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      if (scrollContainerRef.current) {
        resizeObserver.unobserve(scrollContainerRef.current);
      }
    };
  }, []);

  const handleRowClick = useCallback((index, event) => {
    event.preventDefault();
    
    setSelectedIndices(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isShiftPressed && initialSelectionIndex !== null) {
        const start = Math.min(initialSelectionIndex, index);
        const end = Math.max(initialSelectionIndex, index);
        for (let i = start; i <= end; i++) {
          newSelected.add(i);
        }
      } else if (isCtrlPressed) {
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
      } else {
        newSelected.clear();
        newSelected.add(index);
      }
      setInitialSelectionIndex(index);
      return newSelected;
    });
  }, [isShiftPressed, isCtrlPressed, initialSelectionIndex]);

  const handleContextMenu = useCallback((event, index) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      index: index,
      isSingleLog: !selectedIndices.has(index)
    });
  }, [selectedIndices]);

  const handleCopySelected = useCallback(() => {
    const selectedLogs = Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map(index => {
        const log = filteredLogs[index];
        return `${log.timestamp}${log.level ? ` [${log.level.toUpperCase()}]` : ''} ${log.message}`;
      })
      .join('\n');
  
    if (selectedLogs) {
      navigator.clipboard.writeText(selectedLogs).then(() => {
        console.log('Selected logs copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy logs: ', err);
      });
    }
    setContextMenu(null);
  }, [selectedIndices, filteredLogs]);

  const handleCopySingle = useCallback(() => {
    if (contextMenu) {
      const log = filteredLogs[contextMenu.index];
      const logString = `${log.timestamp}${log.level ? ` [${log.level.toUpperCase()}]` : ''} ${log.message}`;

      navigator.clipboard.writeText(logString).then(() => {
        console.log('Single log copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy log: ', err);
      });
    }
    setContextMenu(null);
  }, [contextMenu, filteredLogs]);

  const handleSortClick = () => {
    setSortOrder(prevOrder => {
      switch (prevOrder) {
        case 'none':
          return 'asc';
        case 'asc':
          return 'desc';
        case 'desc':
          return 'none';
        default:
          return 'none';
      }
    });
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc':
        return <ChevronUp className="ml-1" size={14} />;
      case 'desc':
        return <ChevronDown className="ml-1" size={14} />;
      default:
        return <Minus className="ml-1" size={14} />;
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevels(prevLevels => {
      const newLevels = new Set(prevLevels);
      if (newLevels.has(level)) {
        newLevels.delete(level);
      } else {
        newLevels.add(level);
      }
      return newLevels;
    });
  };

  const handleSelectAllLevels = () => {
    setSelectedLevels(new Set(logLevels));
  };

  const handleDeselectAllLevels = () => {
    setSelectedLevels(new Set());
  };

  const handleSearchSelected = useCallback(() => {
    const selectedLogs = Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map(index => filteredLogs[index]);
    
    handleSearchClick(
      selectedLogs,
      `
      You are a professional debugger, specializing in log analysis. 
      You have been hired by a company to analyze their logs and find the root cause of an issue.
      The company has provided you with a set of logs to analyze.
      Take each log, and analyze it further to determine the root cause of the issue.
      Each line starts with an index, in your analysis, you must directly reference the index of the log.
      `
    );
    setContextMenu(null);
  }, [selectedIndices, filteredLogs, handleSearchClick]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex flex-col gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex flex-wrap gap-2">
            {logLevels.map(level => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedLevels.has(level)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
            <button
              onClick={handleSelectAllLevels}
              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAllLevels}
              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden" ref={tableRef}>
        <div className="h-full overflow-hidden" ref={scrollContainerRef}>
          <table className="min-w-full">
            <thead className="bg-gray-900 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6 cursor-pointer hover:bg-gray-800"
                  onClick={handleSortClick}
                >
                  <div className="flex items-center">
                    Timestamp
                    {getSortIcon()}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
          </table>
          <div className="scroll-body overflow-y-auto">
            <table className="min-w-full">
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredLogs.map((log, index) => (
                  <LogRow
                    key={index}
                    log={log}
                    index={index}
                    isSelected={selectedIndices.has(index)}
                    onClick={(e) => handleRowClick(index, e)}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopySelected={handleCopySelected}
          onCopySingle={handleCopySingle}
          isSingleLog={contextMenu.isSingleLog}
          onSearchSelected={handleSearchSelected}
        />
      )}
    </div>
  );
};

export default LogViewer;