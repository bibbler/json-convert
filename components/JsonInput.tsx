import React, { useState } from 'react';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JsonInput: React.FC<JsonInputProps> = ({ value, onChange }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="json-input" className="font-semibold text-gray-300">
            Your JSON Data
        </label>
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-3 py-1 border border-gray-600 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all disabled:opacity-50"
          disabled={!value}
          aria-live="polite"
        >
          {isCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
        <textarea
            id="json-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your JSON array here..."
            className="w-full flex-grow bg-gray-950 border border-gray-700 rounded-lg p-4 text-gray-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none"
            spellCheck="false"
        />
    </div>
  );
};