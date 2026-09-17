import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Table,
  Modal,
  FormField,
  Input,
  LoadingState,
  EmptyState,
  Badge,
} from '../components/ui';
import { feeService } from '../services/feeService';
import { studentService } from '../services/studentService';
import { Plus, Printer, CheckCircle, Receipt, DollarSign, ArrowLeft } from 'lucide-react';

export const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const preselectedFeeItem = searchParams.get('fee_item') || '';
  const preselectedChild = searchParams.get('child') || '';

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(!!preselectedFeeItem);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    fee_item: preselectedFeeItem,
    child: preselectedChild,
    amount: '',
    payment_method: 'UPI',
    reference_number: '',
    notes: '',
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: () => feeService.getFeePayments(),
  });

  const { data: childrenData } = useQuery({
    queryKey: ['children-select'],
    queryFn: () => studentService.getChildren(),
  });

  const { data: feeItemsData } = useQuery({
    queryKey: ['fee-items-select'],
    queryFn: () => feeService.getStudentFeeItems({ status: 'PENDING' }),
  });

  const paymentsList = paymentsData?.results || (Array.isArray(paymentsData) ? paymentsData : []);
  const children = childrenData?.results || (Array.isArray(childrenData) ? childrenData : []);
  const feeItems = feeItemsData?.results || (Array.isArray(feeItemsData) ? feeItemsData : []);

  const createPaymentMutation = useMutation({
    mutationFn: (payload) => feeService.createFeePayment(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fee-items'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      setIsRecordModalOpen(false);
      setSelectedReceipt(res);
      setPaymentForm({ fee_item: '', child: '', amount: '', payment_method: 'UPI', reference_number: '', notes: '' });
    },
  });

  const columns = [
    {
      header: 'Receipt #',
      accessorKey: 'receipt_number',
      cell: ({ row }) => <span className="font-mono font-bold text-blue-600">{row.original.receipt_number}</span>,
    },
    {
      header: 'Student',
      accessorKey: 'child_name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-900">{row.original.child_name}</div>
          <div className="text-xs text-slate-400">ID: {row.original.child_admission_number}</div>
        </div>
      ),
    },
    {
      header: 'Payment Date',
      accessorKey: 'payment_date',
    },
    {
      header: 'Method',
      accessorKey: 'payment_method',
      cell: ({ row }) => <Badge variant="neutral">{row.original.payment_method}</Badge>,
    },
    {
      header: 'Amount Paid',
      accessorKey: 'amount',
      cell: ({ row }) => <span className="font-bold text-emerald-700">₹{parseFloat(row.original.amount).toLocaleString()}</span>,
    },
    {
      header: 'Received By',
      accessorKey: 'received_by_name',
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.received_by_name || 'Staff'}</span>,
    },
    {
      header: 'Receipt',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedReceipt(row.original)}
          className="gap-1.5 text-xs"
        >
          <Receipt className="w-3.5 h-3.5 text-blue-600" />
          <span>Receipt</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Payments & Official Receipts"
        description="Record fee collections, issue unique receipts, and verify transaction history."
        actions={
          <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </Button>
        }
      />

      {/* Payments Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200">
          <LoadingState message="Loading payment transactions..." />
        </div>
      ) : paymentsList.length === 0 ? (
        <EmptyState
          title="No fee payments recorded yet"
          description="Record your first payment to generate official school receipts."
          actionText="Record Payment"
          onAction={() => setIsRecordModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table data={paymentsList} columns={columns} />
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Fee Payment"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPaymentMutation.mutate(paymentForm);
          }}
          className="space-y-4"
        >
          <FormField label="Select Child" required>
            <select
              value={paymentForm.child}
              onChange={(e) => setPaymentForm((p) => ({ ...p, child: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Choose student...</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.admission_number})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Amount Paid (INR)" required>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 3500.00"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Payment Method" required>
            <select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="UPI">UPI / QR Code</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CHEQUE">Cheque / Demand Draft</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>

          <FormField label="Reference / Transaction Number">
            <Input
              placeholder="e.g. UPI/2026/998120 or Cheque #10293"
              value={paymentForm.reference_number}
              onChange={(e) => setPaymentForm((p) => ({ ...p, reference_number: e.target.value }))}
            />
          </FormField>

          <FormField label="Notes">
            <Input
              placeholder="Remarks..."
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createPaymentMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              Generate Official Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Receipt"
          size="md"
        >
          <div id="printable-receipt" className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-800">
            {/* School Header */}
            <div className="text-center border-b pb-4 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{selectedReceipt.school_name || 'Sunrise Kids Academy'}</h2>
              <p className="text-xs text-slate-500">{selectedReceipt.school_address || 'Blossom Valley'}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full font-mono text-xs font-bold text-blue-700">
                Receipt #{selectedReceipt.receipt_number}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400">Student Name</span>
                <p className="font-bold text-slate-900">{selectedReceipt.child_name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Payment Date</span>
                <p className="font-semibold">{selectedReceipt.payment_date}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Payment Mode</span>
                <p className="font-semibold">{selectedReceipt.payment_method}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Ref / Txn No</span>
                <p className="font-mono text-xs font-semibold">{selectedReceipt.reference_number || 'N/A'}</p>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <span className="font-bold text-emerald-800">Total Amount Received</span>
              <span className="text-2xl font-black text-emerald-700">₹{parseFloat(selectedReceipt.amount).toLocaleString()}</span>
            </div>

            <div className="text-xs text-slate-400 text-center">
              Received By: <strong>{selectedReceipt.received_by_name || 'Accounts Office'}</strong> • Computer Generated Receipt
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
              Close
            </Button>
            <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
