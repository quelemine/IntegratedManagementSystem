import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState('system'); // 'system' or 'external'
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_method: 'cash',
    transaction_reference: '',
    receipt_number: '',
    notes: ''
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
      await axios.post('/payments', formData);
      setShowModal(false);
      setPaymentType('system');
      setFormData({
        invoice_id: '',
        amount_paid: '',
        payment_method: 'cash',
        transaction_reference: '',
        receipt_number: '',
        notes: ''
      });
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment');
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
                <button
                  onClick={() => {
                    setShowModal(true)
                    setPaymentType('system')
                  }}
                  className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Record</span>
                  <span className="sm:hidden">Rec</span>
                </button>
                <button
                  onClick={() => {
                    setShowModal(true)
                    setPaymentType('external')
                  }}
                  className="px-3 py-2 sm:px-4 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">External</span>
                  <span className="sm:hidden">Ext</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border">Date</th>
                <th className="px-4 py-3 border">Student</th>
                <th className="px-4 py-3 border">Invoice #</th>
                <th className="px-4 py-3 border">Method</th>
                <th className="px-4 py-3 border">Amount</th>
                <th className="px-4 py-3 border">Reference</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Received By</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border">
                    {payment.student_first_name} {payment.student_last_name}
                  </td>
                  <td className="px-4 py-3 border">{payment.invoice_number || 'N/A'}</td>
                  <td className="px-4 py-3 border capitalize">{payment.payment_method}</td>
                  <td className="px-4 py-3 border">
                    {payment.amount?.toLocaleString()} {payment.currency}
                  </td>
                  <td className="px-4 py-3 border">{payment.payment_reference || 'N/A'}</td>
                  <td className="px-4 py-3 border">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 border">
                    {payment.received_by_first_name} {payment.received_by_last_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="p-6 text-center text-gray-500">No payments found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {paymentType === 'system' ? 'Record Payment' : 'External Payment Entry'}
            </h2>
            <form onSubmit={handleSubmit}>
              {paymentType === 'system' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Invoice ID</label>
                    <input
                      type="text"
                      value={formData.invoice_id}
                      onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Payment Method</label>
                    <select
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
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Transaction Reference</label>
                    <input
                      type="text"
                      value={formData.transaction_reference}
                      onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Notes</label>
                    <textarea
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
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Receipt Number *</label>
                    <input
                      type="text"
                      value={formData.receipt_number}
                      onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                      placeholder="Enter receipt number from external source"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Payment Method *</label>
                    <select
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
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Transaction Reference</label>
                    <input
                      type="text"
                      value={formData.transaction_reference}
                      onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Bank reference, check number, etc."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      rows="3"
                      placeholder="Additional details about the payment"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setPaymentType('system')
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {paymentType === 'system' ? 'Record Payment' : 'Add External Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
