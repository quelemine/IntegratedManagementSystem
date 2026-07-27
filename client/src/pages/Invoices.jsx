import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Invoices() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/invoices');
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (id) => {
    try {
      const response = await axios.get(`/invoices/${id}`);
      setSelectedInvoice(response.data.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
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
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Invoice Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedInvoice ? (
          <div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Back to Invoices
            </button>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Invoice #{selectedInvoice.invoice_number}</h2>
                  <p className="text-gray-600">Student: {selectedInvoice.student_first_name} {selectedInvoice.student_last_name}</p>
                  <p className="text-gray-600">Student ID: {selectedInvoice.student_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500">Academic Year</p>
                  <p className="font-medium">{selectedInvoice.academic_year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subtotal</p>
                  <p className="font-medium">{selectedInvoice.subtotal?.toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Discount</p>
                  <p className="font-medium">{selectedInvoice.discount_amount?.toLocaleString() || 0} {selectedInvoice.currency}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">{selectedInvoice.total_amount?.toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Balance Due</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedInvoice.balance_due?.toLocaleString()} {selectedInvoice.currency}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Description</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Unit Price</th>
                      <th className="px-4 py-2 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 border">{item.description}</td>
                        <td className="px-4 py-2 border">{item.quantity}</td>
                        <td className="px-4 py-2 border">{item.unit_price?.toLocaleString()}</td>
                        <td className="px-4 py-2 border">{item.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Date</th>
                        <th className="px-4 py-2 border">Method</th>
                        <th className="px-4 py-2 border">Amount</th>
                        <th className="px-4 py-2 border">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-2 border">{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 border capitalize">{payment.payment_method}</td>
                          <td className="px-4 py-2 border">{payment.amount?.toLocaleString()}</td>
                          <td className="px-4 py-2 border">{payment.payment_reference || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <p className="text-gray-500">Notes</p>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border">Invoice #</th>
                  <th className="px-4 py-3 border">Student</th>
                  <th className="px-4 py-3 border">Academic Year</th>
                  <th className="px-4 py-3 border">Total</th>
                  <th className="px-4 py-3 border">Due Date</th>
                  <th className="px-4 py-3 border">Status</th>
                  <th className="px-4 py-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 border">
                      {invoice.student_first_name} {invoice.student_last_name}
                    </td>
                    <td className="px-4 py-3 border">{invoice.academic_year}</td>
                    <td className="px-4 py-3 border">
                      {invoice.total_amount?.toLocaleString()} {invoice.currency}
                    </td>
                    <td className="px-4 py-3 border">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 border">
                      <button
                        onClick={() => fetchInvoiceDetails(invoice.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <div className="p-6 text-center text-gray-500">No invoices found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
