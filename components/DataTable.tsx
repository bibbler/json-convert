import React, { useState, useMemo, useRef } from 'react';
import { CryptoData } from '../types';
import { ExpandedRowContent } from './ExpandedRowContent';

interface DataTableProps {
  data: any[];
  viewMode: 'clean' | 'raw';
  sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
  onSort: (config: { key: string; direction: 'ascending' | 'descending' } | null) => void;
  rawHeaders: string[];
  onRawHeaderReorder: (headers: string[]) => void;
  cleanColumns: typeof initialCleanColumns;
  onCleanColumnReorder: (columns: typeof initialCleanColumns) => void;
}

const getNestedValue = (obj: any, path: string) => {
    if (typeof obj !== 'object' || obj === null) return undefined;
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

const renderCellContent = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
        return <span className="text-gray-500 italic">null</span>;
    }
    const type = typeof value;
    if (type === 'object') {
        return (
            <pre className="text-xs bg-gray-950 p-2 rounded max-w-xs overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }
    if (type === 'boolean') {
        return <span className={`font-semibold ${value ? 'text-green-400' : 'text-red-400'}`}>{String(value)}</span>;
    }
    if (type === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        try {
            new URL(value);
            return <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline">{value}</a>
        } catch (_) {}
    }
    return String(value);
};

const SignalBadge: React.FC<{ signal: 'BUY' | 'SELL' | 'NEUTRAL' }> = ({ signal }) => {
    const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-block";
    const colorClasses = {
        BUY: 'bg-green-500/20 text-green-300',
        SELL: 'bg-red-500/20 text-red-300',
        NEUTRAL: 'bg-gray-500/20 text-gray-300',
    };
    return <span className={`${baseClasses} ${colorClasses[signal] || colorClasses.NEUTRAL}`}>{signal}</span>;
};

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
    return (
        <span className="w-4 h-4 ml-2 shrink-0">
            {direction && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    {direction === 'ascending' 
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    }
                </svg>
            )}
        </span>
    );
};

export const initialCleanColumns = [
    { id: 'coin', label: 'Coin', render: (row: CryptoData) => (
        <div className="flex items-center">
            <div className="text-sm font-medium text-white">{row.coin}</div>
            <div className="ml-2 text-sm text-gray-400">{row.symbol}</div>
        </div>
    )},
    { id: 'currentPrice', label: 'Price' },
    { id: 'analysis.signal', label: 'Signal', render: (row: CryptoData) => <SignalBadge signal={row.analysis.signal} /> },
    { id: 'priceChanges.24h', label: '24h Change' },
];

export const DataTable: React.FC<DataTableProps> = ({ 
    data, 
    viewMode, 
    sortConfig, 
    onSort,
    rawHeaders,
    onRawHeaderReorder,
    cleanColumns,
    onCleanColumnReorder,
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const draggedItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  
  const isCleanViewCompatible = useMemo(() =>
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0] !== null &&
    'coin' in data[0] &&
    'symbol' in data[0] &&
    'analysis' in data[0] &&
    'marketMetrics' in data[0], [data]);

  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
        if (sortConfig.direction === 'ascending') {
            onSort({ key, direction: 'descending' });
        } else {
            onSort(null);
        }
    } else {
        onSort({ key, direction: 'ascending' });
    }
    setExpandedRow(null);
  };
  
  const handleDragSort = (list: any[], setter: Function) => {
    if (draggedItemIndex.current === null || dragOverItemIndex.current === null) return;
    const newList = [...list];
    const draggedItem = newList.splice(draggedItemIndex.current, 1)[0];
    newList.splice(dragOverItemIndex.current, 0, draggedItem);
    draggedItemIndex.current = null;
    dragOverItemIndex.current = null;
    setter(newList);
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center flex items-center justify-center h-full">
            <p className="text-gray-400">Data will appear here once valid JSON is provided.</p>
        </div>
    );
  }

  // --- CLEAN VIEW ---
  if (viewMode === 'clean' && isCleanViewCompatible) {
    const typedData = data as CryptoData[];
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-auto max-h-[70vh]">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                    <th scope="col" className="sticky top-0 bg-gray-900 py-3.5 px-4 text-left text-sm font-semibold text-gray-300 w-12">#</th>
                    <th scope="col" className="sticky top-0 bg-gray-900 w-12 px-4"></th>
                    {cleanColumns.map((col, index) => (
                        <th
                            key={col.id}
                            scope="col"
                            className="sticky top-0 bg-gray-900 py-3.5 px-4 text-left text-sm font-semibold text-gray-300 cursor-pointer select-none"
                            onClick={() => handleSort(col.id)}
                            draggable
                            onDragStart={() => draggedItemIndex.current = index}
                            onDragEnter={() => dragOverItemIndex.current = index}
                            onDragEnd={() => handleDragSort(cleanColumns, onCleanColumnReorder)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                           <div className="flex items-center justify-between">
                                <span className="whitespace-nowrap">{col.label}</span>
                                <SortIcon direction={sortConfig?.key === col.id ? sortConfig.direction : null} />
                           </div>
                        </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                {typedData.map((row, index) => (
                  <React.Fragment key={row.symbol + index}>
                    <tr className="hover:bg-gray-800/60 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono text-center">{index + 1}</td>
                        <td className="px-4 py-4">
                            <button 
                                onClick={() => setExpandedRow(expandedRow === index ? null : index)} 
                                className="text-gray-400 hover:text-white transition-transform duration-200" 
                                style={{ transform: expandedRow === index ? 'rotate(90deg)' : 'rotate(0deg)'}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </button>
                        </td>
                        {cleanColumns.map(col => {
                           const cellValue = getNestedValue(row, col.id);
                           return (
                            <td key={col.id} className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                {col.render ? col.render(row) : renderCellContent(cellValue)}
                            </td>
                           )
                        })}
                    </tr>
                    {expandedRow === index && (
                        <tr>
                            <td colSpan={cleanColumns.length + 2} className="p-0">
                                <ExpandedRowContent metrics={row.marketMetrics} analysis={row.analysis} />
                            </td>
                        </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    );
  }

  // --- RAW VIEW ---
  const isArrayOfPrimitives = typeof data[0] !== 'object' || data[0] === null;
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th scope="col" className="sticky top-0 bg-gray-900 py-3.5 px-4 text-left text-sm font-semibold text-gray-300 w-12">#</th>
              {rawHeaders.map((header, index) => (
                <th
                  key={header}
                  scope="col"
                  className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300 sticky top-0 bg-gray-900 cursor-pointer select-none"
                  onClick={() => handleSort(header)}
                  draggable={!isArrayOfPrimitives}
                  onDragStart={() => draggedItemIndex.current = index}
                  onDragEnter={() => dragOverItemIndex.current = index}
                  onDragEnd={() => handleDragSort(rawHeaders, onRawHeaderReorder)}
                  onDragOver={(e) => e.preventDefault()}
                >
                   <div className="flex items-center justify-between">
                        <span className="whitespace-nowrap">{header}</span>
                        <SortIcon direction={sortConfig?.key === header ? sortConfig.direction : null} />
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900/50">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/60 transition-colors duration-150">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-mono text-center align-top">{rowIndex + 1}</td>
                {rawHeaders.map((header) => {
                    const cellValue = isArrayOfPrimitives ? row : getNestedValue(row, header);
                    return (
                      <td key={header} className="px-4 py-4 text-sm text-gray-300 align-top">
                          {renderCellContent(cellValue)}
                      </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};