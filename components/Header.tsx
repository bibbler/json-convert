import React from 'react';

interface HeaderProps {
    isEditorVisible: boolean;
    onToggleEditor: () => void;
    onImport: () => void;
    onExportJson: () => void;
    onExportCsv: () => void;
    onCopyTable: () => void;
    isTableCopied: boolean;
    onReset: () => void;
    isDataAvailable: boolean;
    viewMode: 'clean' | 'raw';
    onToggleViewMode: () => void;
    isStructuredData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    isEditorVisible, 
    onToggleEditor, 
    onImport, 
    onExportJson, 
    onExportCsv,
    onCopyTable,
    isTableCopied,
    onReset,
    isDataAvailable,
    viewMode,
    onToggleViewMode,
    isStructuredData
}) => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
        JSON to Table Converter
      </h1>
      <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
        Paste your JSON array, or import a file, to instantly generate a clean, readable table.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
            onClick={onToggleEditor}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: isEditorVisible ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {isEditorVisible ? 'Collapse Editor' : 'Expand Editor'}
        </button>
        {isStructuredData && (
          <button
            onClick={onToggleViewMode}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
            aria-label={`Switch to ${viewMode === 'clean' ? 'raw' : 'clean'} table view`}
          >
            {viewMode === 'clean' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            {viewMode === 'clean' ? 'Show Raw Data' : 'Show Clean View'}
          </button>
        )}
        <button
            onClick={onReset}
            disabled={!isDataAvailable}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset table sort and column order"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
          </svg>
          Reset View
        </button>
        <button
            onClick={onImport}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
            aria-label="Import JSON from a file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
        </button>
         <button
            onClick={onCopyTable}
            disabled={!isDataAvailable}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Copy table data to clipboard"
            aria-live="polite"
        >
            {isTableCopied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
            )}
            {isTableCopied ? 'Copied!' : 'Copy Table'}
        </button>
        <button
            onClick={onExportJson}
            disabled={!isDataAvailable}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Export table data to a JSON file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
        </button>
        <button
            onClick={onExportCsv}
            disabled={!isDataAvailable}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Export table data to a CSV file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 4v16M15 4v16" />
            </svg>
            Export CSV
        </button>
      </div>
    </header>
  );
};