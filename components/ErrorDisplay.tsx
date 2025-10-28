
import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
      <p className="font-semibold">Error</p>
      <p>{error}</p>
    </div>
  );
};
