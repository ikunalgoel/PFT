import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { TransactionInput } from '../types/transaction';

interface CSVUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (transactions: TransactionInput[]) => Promise<void>;
}

interface ParsedTransaction {
  date: string;
  amount: string;
  category: string;
  merchant?: string;
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const REQUIRED_COLUMNS = ['date', 'amount', 'category'];

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<TransactionInput[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateCSVStructure = (headers: string[]): string | null => {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    
    for (const required of REQUIRED_COLUMNS) {
      if (!normalizedHeaders.includes(required)) {
        return `Missing required column: ${required}`;
      }
    }
    
    return null;
  };

  const validateTransaction = (
    data: ParsedTransaction,
    rowIndex: number
  ): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate date
    if (!data.date || !data.date.trim()) {
      errors.push({
        row: rowIndex,
        field: 'date',
        message: 'Date is required',
      });
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowIndex,
          field: 'date',
          message: 'Invalid date format',
        });
      }
    }

    // Validate amount
    if (!data.amount || !data.amount.trim()) {
      errors.push({
        row: rowIndex,
        field: 'amount',
        message: 'Amount is required',
      });
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({
          row: rowIndex,
          field: 'amount',
          message: 'Amount must be a positive number',
        });
      }
    }

    // Validate category
    if (!data.category || !data.category.trim()) {
      errors.push({
        row: rowIndex,
        field: 'category',
        message: 'Category is required',
      });
    }

    return errors;
  };

  const parseCSV = (file: File) => {
    Papa.parse<ParsedTransaction>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        // Validate CSV structure
        const structureError = validateCSVStructure(results.meta.fields || []);
        if (structureError) {
          setUploadError(structureError);
          return;
        }

        // Validate and transform data
        const transactions: TransactionInput[] = [];
        const errors: ValidationError[] = [];

        results.data.forEach((row, index) => {
          const rowErrors = validateTransaction(row, index + 2); // +2 for header and 0-index
          errors.push(...rowErrors);

          if (rowErrors.length === 0) {
            transactions.push({
              date: row.date.trim(),
              amount: parseFloat(row.amount),
              category: row.category.trim(),
              merchant: row.merchant?.trim() || undefined,
              notes: row.notes?.trim() || undefined,
            });
          }
        });

        setValidationErrors(errors);
        setParsedData(transactions);

        if (errors.length === 0 && transactions.length === 0) {
          setUploadError('No valid transactions found in CSV file');
        }
      },
      error: (error) => {
        setUploadError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleFileSelect = (selectedFile: File) => {
    resetState();
    
    if (!selectedFile.name.endsWith('.csv')) {
      setUploadError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setUploadError('No valid transactions to upload');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      await onUpload(parsedData);
      setUploadSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload transactions. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-4 pt-4 pb-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900">
                Upload Transactions from CSV
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Upload a CSV file with columns: date, amount, category, merchant (optional), notes (optional)
              </p>
            </div>

            {/* Success Message */}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Transactions uploaded successfully!
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {uploadError}
              </div>
            )}

            {/* Drag and Drop Area */}
            {!file && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors active:bg-gray-50 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Tap to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}

            {/* File Info and Preview */}
            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  </div>
                  <button
                    onClick={resetState}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Validation Errors ({validationErrors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <li key={index}>
                            Row {error.row}, {error.field}: {error.message}
                          </li>
                        ))}
                        {validationErrors.length > 10 && (
                          <li className="font-medium">
                            ... and {validationErrors.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {parsedData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Preview ({parsedData.length} valid transaction{parsedData.length !== 1 ? 's' : ''})
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Category
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Merchant
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {parsedData.slice(0, 5).map((transaction, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  ${transaction.amount.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  {transaction.category}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-500">
                                  {transaction.merchant || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedData.length > 5 && (
                        <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                          ... and {parsedData.length - 5} more transactions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 sm:py-2 bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || uploadSuccess || parsedData.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 bg-blue-600 text-sm sm:text-base font-medium text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : `Upload ${parsedData.length} Transaction${parsedData.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
