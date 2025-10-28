import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { JsonInput } from './components/JsonInput';
import { DataTable, initialCleanColumns } from './components/DataTable';
import { INITIAL_JSON_DATA } from './constants';
import { Header } from './components/Header';
import { ErrorDisplay } from './components/ErrorDisplay';
import { CryptoData } from './types';
import { SubJsonSelector } from './components/SubJsonSelector';

const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<string>(
    JSON.stringify(INITIAL_JSON_DATA, null, 2)
  );
  const [tableData, setTableData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJsonEditorVisible, setIsJsonEditorVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'clean' | 'raw'>('clean');
  const [isStructuredData, setIsStructuredData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // New state for handling nested JSON
  const [parsedJson, setParsedJson] = useState<any | null>(null);
  const [subJsonPaths, setSubJsonPaths] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('root');

  // State lifted from DataTable
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [cleanColumns, setCleanColumns] = useState(initialCleanColumns);
  const [isTableCopied, setIsTableCopied] = useState(false);

  const isCryptoData = useCallback((data: any): data is CryptoData[] => {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstItem = data[0];
    return (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'coin' in firstItem &&
        'symbol' in firstItem &&
        'currentPrice' in firstItem &&
        'analysis' in firstItem &&
        'marketMetrics' in firstItem &&
        'priceChanges' in firstItem
    );
  }, []);

  const findSubJsonPaths = useCallback((data: any): string[] => {
    const paths = new Set<string>();

    const finder = (obj: any, currentPath: string) => {
        if (!obj) return;

        if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            if (currentPath) {
                paths.add(currentPath);
            }
        }

        if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    finder(obj[key], newPath);
                }
            }
        }
    };

    finder(data, '');
    return ['root', ...Array.from(paths).sort()];
  }, []);

  // Effect 1: Parse raw JSON string and find paths
  useEffect(() => {
    try {
      if (jsonData.trim() === '') {
        setParsedJson(null);
        setSubJsonPaths([]);
        setError(null);
        return;
      }
      const parsedData = JSON.parse(jsonData);
      setParsedJson(parsedData);
      
      const paths = findSubJsonPaths(parsedData);
      setSubJsonPaths(paths);
      
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (paths.includes('data.coins')) {
          setSelectedPath('data.coins');
        } else {
          setSelectedPath('root');
        }
      } else {
        setSelectedPath('root'); // Always reset to root on new JSON
      }
      
      setError(null);

    } catch (e) {
      setParsedJson(null);
      setSubJsonPaths([]);
      setTableData([]);
      setIsStructuredData(false);
      if (e instanceof Error) {
        setError(`Invalid JSON format: ${e.message}`);
      } else {
        setError('An unknown error occurred while parsing JSON.');
      }
    }
  }, [jsonData, findSubJsonPaths]);

  // Effect 2: Update table data based on parsed JSON and selected path
  useEffect(() => {
    if (!parsedJson) {
      setTableData([]);
      setIsStructuredData(false);
      return;
    }

    let dataForTable: any;
    if (selectedPath === 'root') {
      dataForTable = parsedJson;
    } else {
      dataForTable = getNestedValue(parsedJson, selectedPath);
    }
    
    let dataArray: any[] = [];
    if (Array.isArray(dataForTable)) {
      dataArray = dataForTable;
    } else if (typeof dataForTable === 'object' && dataForTable !== null) {
      dataArray = [dataForTable];
    } else if (dataForTable !== undefined && dataForTable !== null) {
       // Handle case where path points to a primitive value
      dataArray = [{ Value: dataForTable }];
    }

    if (dataArray.length === 0) {
      setTableData([]);
      setIsStructuredData(false);
      return;
    }

    setTableData(dataArray);
    
    if (isCryptoData(dataArray)) {
      setIsStructuredData(true);
      setViewMode('clean');
    } else {
      setIsStructuredData(false);
      setViewMode('raw');
    }
    
    setSortConfig(null);
    setCleanColumns(initialCleanColumns);

  }, [parsedJson, selectedPath, isCryptoData]);

  useEffect(() => {
    if (viewMode === 'raw' && tableData.length > 0) {
        const isArrayOfPrimitives = typeof tableData[0] !== 'object' || tableData[0] === null;
        if (isArrayOfPrimitives) {
            setRawHeaders(['Value']);
        } else {
            const allKeys = new Set<string>();
            tableData.forEach(row => {
                if (typeof row === 'object' && row !== null) {
                    Object.keys(row).forEach(key => allKeys.add(key));
                }
            });
            setRawHeaders(Array.from(allKeys));
        }
    }
  }, [tableData, viewMode]);

  const sortedData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = getNestedValue(a, sortConfig.key);
        const bVal = getNestedValue(b, sortConfig.key);

        const parseValue = (value: any) => {
          if (value === null || value === undefined) return -Infinity;
          if (typeof value === 'boolean') return value ? 1 : 0;
          if (typeof value === 'string') {
            const num = parseFloat(value.replace(/[$,%]/g, ''));
            return isNaN(num) ? value.toLowerCase() : num;
          }
          return value;
        };

        const parsedA = parseValue(aVal);
        const parsedB = parseValue(bVal);

        if (parsedA < parsedB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (parsedA > parsedB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const handleToggleViewMode = () => {
    setViewMode(prev => (prev === 'clean' ? 'raw' : 'clean'));
    setSortConfig(null); // Reset sort when changing view
  };
  
  const handleResetView = () => {
    setSortConfig(null);
    setCleanColumns(initialCleanColumns);
    // Re-calculate original raw headers order
    if (viewMode === 'raw' && tableData.length > 0) {
       const allKeys = new Set<string>();
       tableData.forEach(row => {
           if (typeof row === 'object' && row !== null) {
               Object.keys(row).forEach(key => allKeys.add(key));
           }
       });
       setRawHeaders(Array.from(allKeys));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Invalid file type. Please select a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setJsonData(text);
        }
      } catch (err) { setError('Error reading file.'); }
    };
    reader.onerror = () => { setError('Error reading file.'); };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportJson = () => {
    if (sortedData.length === 0 || error) return;
    
    let dataToExport: any[];
    
    if (viewMode === 'clean' && isStructuredData) {
        dataToExport = sortedData.map(row => {
            const newRow: {[key: string]: any} = {};
            cleanColumns.forEach(col => {
                newRow[col.id] = getNestedValue(row, col.id);
            });
            return newRow;
        });
    } else {
        const isArrayOfPrimitives = typeof sortedData[0] !== 'object' || sortedData[0] === null;
        if (isArrayOfPrimitives) {
          dataToExport = sortedData.map(item => item.Value); // Unpack from { Value: ... }
        } else {
          dataToExport = sortedData.map(row => {
              const newRow: {[key: string]: any} = {};
              rawHeaders.forEach(header => {
                  newRow[header] = row[header];
              });
              return newRow;
          });
        }
    }

    const jsonContent = JSON.stringify(dataToExport, null, 2);
    downloadFile(jsonContent, 'table-data.json', 'application/json');
  };

  const convertToText = (data: any[], headers: string[], columnLabels: string[], separator: ',' | '\t'): string => {
    const escapeFn = (val: any): string => {
      if (val === undefined || val === null) return '';
      let str = String(val);
      if (separator === ',') {
         if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
         }
         return str;
      } else { // TSV
         return str.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
      }
    };

    const headerRow = columnLabels.join(separator);
    const textRows = [headerRow];

    data.forEach(row => {
      const values = headers.map(headerKey => {
        const value = getNestedValue(row, headerKey);
        const finalValue = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;
        return escapeFn(finalValue);
      });
      textRows.push(values.join(separator));
    });

    return textRows.join('\n');
  };

  const handleExportCsv = () => {
    if (sortedData.length === 0 || error) return;

    let headers: string[];
    let labels: string[];

    if (viewMode === 'clean' && isStructuredData) {
        headers = cleanColumns.map(c => c.id);
        labels = cleanColumns.map(c => c.label);
    } else {
        const isArrayOfPrimitives = typeof sortedData[0] !== 'object' || sortedData[0] === null;
        if (isArrayOfPrimitives) {
            const csvContent = "Value\n" + sortedData.map(v => `${v.Value}`).join("\n");
            downloadFile(csvContent, 'table-data.csv', 'text/csv;charset=utf-8;');
            return;
        }
        headers = rawHeaders;
        labels = rawHeaders;
    }
    const csvContent = convertToText(sortedData, headers, labels, ',');
    downloadFile(csvContent, 'table-data.csv', 'text/csv;charset=utf-8;');
  };

  const handleCopyTable = () => {
    if (sortedData.length === 0 || error) return;

    let headers: string[];
    let labels: string[];
    let tsvContent: string = '';

    if (viewMode === 'clean' && isStructuredData) {
        headers = cleanColumns.map(c => c.id);
        labels = cleanColumns.map(c => c.label);
    } else {
        const isArrayOfPrimitives = typeof sortedData[0] !== 'object' || sortedData[0] === null;
        if (isArrayOfPrimitives) {
            tsvContent = "Value\n" + sortedData.map(v => `${v.Value}`).join("\n");
        } else {
            headers = rawHeaders;
            labels = rawHeaders;
        }
    }
    if(!tsvContent) {
      tsvContent = convertToText(sortedData, headers, labels, '\t');
    }
    navigator.clipboard.writeText(tsvContent).then(() => {
      setIsTableCopied(true);
      setTimeout(() => setIsTableCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy table: ", err);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
            isEditorVisible={isJsonEditorVisible}
            onToggleEditor={() => setIsJsonEditorVisible(!isJsonEditorVisible)}
            onImport={handleImportClick}
            onExportJson={handleExportJson}
            onExportCsv={handleExportCsv}
            onCopyTable={handleCopyTable}
            isTableCopied={isTableCopied}
            onReset={handleResetView}
            isDataAvailable={tableData.length > 0 && !error}
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
            isStructuredData={isStructuredData}
        />
        <input
          type="file" ref={fileInputRef} onChange={handleFileChange}
          accept=".json,application/json" className="hidden" aria-hidden="true"
        />
        <main className={`mt-8 grid grid-cols-1 ${isJsonEditorVisible ? 'lg:grid-cols-2' : ''} gap-8 transition-all duration-300`}>
          {isJsonEditorVisible && (
            <div className="flex flex-col">
              <JsonInput value={jsonData} onChange={setJsonData} />
              <ErrorDisplay error={error} />
            </div>
          )}
          <div className={`${!isJsonEditorVisible ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
             <SubJsonSelector
                paths={subJsonPaths}
                selectedPath={selectedPath}
                onPathChange={setSelectedPath}
             />
             <DataTable 
                data={sortedData} 
                viewMode={viewMode}
                sortConfig={sortConfig}
                onSort={setSortConfig}
                rawHeaders={rawHeaders}
                onRawHeaderReorder={setRawHeaders}
                cleanColumns={cleanColumns}
                onCleanColumnReorder={setCleanColumns}
             />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;