import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_method: 'cash',
    transaction_reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.post(`${API_URL}/payments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({
        invoice_id: '',
        amount_paid: '',
        payment_method: 'cash',
        transaction_reference: '',
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Record Payment
          </button>
        </div>
      </div>

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
            <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit}>
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
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
