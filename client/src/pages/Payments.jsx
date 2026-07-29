import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Plus, Search, Download, Printer, ChevronLeft, ChevronRight, ArrowUpDown, Edit, Trash2 } from 'lucide-react';

export default function Payments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState('system'); // 'system' or 'external'
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('payment_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_method: 'cash',
    transaction_reference: '',
    receipt_number: '',
    notes: '',
    status: 'completed'
  });

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/payments');
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await axios.put(`/payments/${editingPayment.id}`, formData);
        setPayments(payments.map(p => p.id === editingPayment.id ? { ...p, ...formData } : p));
      } else {
        await axios.post('/payments', formData);
      }
      setShowModal(false);
      setPaymentType('system');
      setEditingPayment(null);
      setFormData({
        invoice_id: '',
        amount_paid: '',
        payment_method: 'cash',
        transaction_reference: '',
        receipt_number: '',
        notes: '',
        status: 'completed'
      });
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Failed to save payment');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      invoice_id: payment.invoice_id || '',
      amount_paid: payment.amount || '',
      payment_method: payment.payment_method || 'cash',
      transaction_reference: payment.payment_reference || '',
      receipt_number: payment.receipt_number || '',
      notes: payment.notes || '',
      status: payment.status || 'completed'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      await axios.delete(`/payments/${id}`);
      setPayments(payments.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredPayments = payments.filter(payment =>
    `${payment.student_first_name} ${payment.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];
    
    if (sortColumn === 'student_name') {
      aVal = `${a.student_first_name} ${a.student_last_name}`;
      bVal = `${b.student_first_name} ${b.student_last_name}`;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  });

  // Pagination
  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage)
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPayments(paginatedPayments.map(p => p.id))
    } else {
      setSelectedPayments([])
    }
  }

  const handleSelectPayment = (id) => {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Student', 'Invoice #', 'Method', 'Amount', 'Reference', 'Status', 'Received By']
    const rows = sortedPayments.map(p => [
      new Date(p.payment_date).toLocaleDateString(),
      `${p.student_first_name} ${p.student_last_name}`,
      p.invoice_number || 'N/A',
      p.payment_method,
      (p?.amount ?? 0).toLocaleString(),
      p.payment_reference || 'N/A',
      p.status,
      `${p.received_by_first_name} ${p.received_by_last_name}`
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Payment Management</h1>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" className="text-sm sm:text-base">
                  <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(true)
                    setPaymentType('system')
                  }}
                  className="text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Record</span>
                  <span className="sm:hidden">Rec</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(true)
                    setPaymentType('external')
                  }}
                  variant="outline"
                  className="text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">External</span>
                  <span className="sm:hidden">Ext</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student, invoice, or reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={paginatedPayments.length > 0 && selectedPayments.length === paginatedPayments.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedPayments.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={paginatedPayments.length > 0 && selectedPayments.length === paginatedPayments.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('payment_date')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Date
                    {sortColumn === 'payment_date' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('student_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Student
                    {sortColumn === 'student_name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Amount
                    {sortColumn === 'amount' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} className={selectedPayments.includes(payment.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => handleSelectPayment(payment.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.student_first_name} {payment.student_last_name}</TableCell>
                  <TableCell>{payment.invoice_number || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method}</TableCell>
                  <TableCell>
                    {(payment?.amount ?? 0).toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>{payment.payment_reference || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {payment.received_by_first_name} {payment.received_by_last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">No payments found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedPayments.length)} of {sortedPayments.length} payments
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setPaymentType('system')
        }}
        title={paymentType === 'system' ? 'Record Payment' : 'External Payment Entry'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {paymentType === 'system' ? (
            <>
              <div>
                <Label htmlFor="invoice_id">Invoice ID</Label>
                <Input
                  id="invoice_id"
                  value={formData.invoice_id}
                  onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount_paid">Amount</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <select
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
              <div>
                <Label htmlFor="transaction_reference">Transaction Reference</Label>
                <Input
                  id="transaction_reference"
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
                <p className="font-semibold">External Payment</p>
                <p>Use this when payment was made outside the system (e.g., bank, cash office)</p>
              </div>
              <div>
                <Label htmlFor="receipt_number">Receipt Number *</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  required
                  placeholder="Enter receipt number from external source"
                />
              </div>
              <div>
                <Label htmlFor="amount_paid">Amount *</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method *</Label>
                <select
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="transaction_reference">Transaction Reference</Label>
                <Input
                  id="transaction_reference"
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                  placeholder="Bank reference, check number, etc."
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  placeholder="Additional details about the payment"
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setPaymentType('system')
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {paymentType === 'system' ? 'Record Payment' : 'Add External Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
