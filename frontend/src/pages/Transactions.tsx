import React, { useState } from 'react';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { CSVUploader } from '../components/CSVUploader';
import { TableSkeleton } from '../components/Skeleton';
import { ErrorMessage, EmptyState } from '../components/ErrorMessage';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useBulkUploadTransactions,
} from '../hooks/useTransactions';
import { Transaction, TransactionInput } from '../types/transaction';

export const Transactions: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCSVUploaderOpen, setIsCSVUploaderOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: transactions = [], isLoading, error, refetch } = useTransactions();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const bulkUploadMutation = useBulkUploadTransactions();

  const handleAddTransaction = () => {
    setFormMode('create');
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setFormMode('edit');
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (data: TransactionInput) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (selectedTransaction) {
      await updateMutation.mutateAsync({
        id: selectedTransaction.id,
        data,
      });
    }
  };

  const handleBulkUpload = async (transactions: TransactionInput[]) => {
    await bulkUploadMutation.mutateAsync(transactions);
  };

  // Show loading skeleton on initial load
  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
        </div>
        <TableSkeleton rows={10} />
      </div>
    );
  }

  // Show error message if load failed
  if (error && transactions.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
        </div>
        <ErrorMessage
          message="Failed to load transactions. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <button
            onClick={() => setIsCSVUploaderOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Upload CSV
          </button>
          <button
            onClick={handleAddTransaction}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Get started by adding your first transaction or uploading a CSV file with your transaction history."
          action={{
            label: 'Add Transaction',
            onClick: handleAddTransaction,
          }}
          icon={
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          isLoading={isLoading}
        />
      )}

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        transaction={selectedTransaction}
        mode={formMode}
      />

      <CSVUploader
        isOpen={isCSVUploaderOpen}
        onClose={() => setIsCSVUploaderOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};
