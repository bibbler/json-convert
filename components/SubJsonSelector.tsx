import React from 'react';

interface SubJsonSelectorProps {
  paths: string[];
  selectedPath: string;
  onPathChange: (path: string) => void;
}

export const SubJsonSelector: React.FC<SubJsonSelectorProps> = ({ paths, selectedPath, onPathChange }) => {
  if (paths.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <label htmlFor="subjson-selector" className="text-sm font-medium text-gray-300 whitespace-nowrap">
        Select data path to display:
      </label>
      <select
        id="subjson-selector"
        value={selectedPath}
        onChange={(e) => onPathChange(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        aria-label="Select a nested JSON object to display in the table"
      >
        {paths.map((path) => (
          <option key={path} value={path}>
            {path === 'root' ? 'Root' : path}
          </option>
        ))}
      </select>
    </div>
  );
};
