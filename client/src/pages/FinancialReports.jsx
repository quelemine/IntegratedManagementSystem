import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, Download, TrendingUp, DollarSign, PieChart } from 'lucide-react';

export default function FinancialReports() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'summary', label: 'Financial Summary' },
    { id: 'balances', label: 'Student Balances' },
    { id: 'daily', label: 'Daily Payments' },
    { id: 'monthly', label: 'Monthly Revenue' },
    { id: 'outstanding', label: 'Outstanding Fees' },
    { id: 'history', label: 'Payment History' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint;
      switch (activeTab) {
        case 'summary':
          endpoint = '/reports/financial-summary';
          break;
        case 'balances':
          endpoint = '/reports/student-balances';
          break;
        case 'daily':
          endpoint = '/reports/daily-payments';
          break;
        case 'monthly':
          endpoint = '/reports/monthly-revenue';
          break;
        case 'outstanding':
          endpoint = '/reports/outstanding-fees';
          break;
        case 'history':
          endpoint = '/reports/payment-history';
          break;
        default:
          endpoint = '/reports/financial-summary';
      }

      const response = await axios.get(endpoint);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6">Loading...</div>;

    switch (activeTab) {
      case 'summary':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold text-blue-600">{data?.total_billed?.toLocaleString() || 0} LRD</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">{data?.total_collected?.toLocaleString() || 0} LRD</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">{data?.outstanding_balance?.toLocaleString() || 0} LRD</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-purple-600">{data?.collection_rate || 0}%</p>
              </div>
            </div>

            {data?.payment_methods && data.payment_methods.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Payments by Method</h3>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {data.payment_methods.map((method, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{method.payment_method}</span>
                        <span className="text-sm text-gray-600">{method.count} transactions</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">{method.total?.toLocaleString()} LRD</p>
                    </div>
                  ))}
                </div>
                <div className="h-48 flex items-center justify-around">
                  {data.payment_methods.map((method, index) => {
                    const percentage = ((method.total / data.total_collected) * 100).toFixed(1);
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold ${colors[index % colors.length]}`}
                          style={{ transform: `scale(${percentage / 100})` }}
                        >
                          {percentage}%
                        </div>
                        <p className="text-sm mt-2 capitalize">{method.payment_method}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data?.invoice_status && data.invoice_status.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Invoice Status Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {data.invoice_status.map((status, index) => {
                    const colors = {
                      paid: 'bg-green-500',
                      partial: 'bg-yellow-500',
                      pending: 'bg-red-500',
                      overdue: 'bg-red-700'
                    };
                    const color = colors[status.status] || 'bg-gray-500';
                    return (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">{status.status}</p>
                        <p className="text-2xl font-bold">{status.count}</p>
                        <p className="text-sm text-gray-600">{status.total?.toLocaleString()} LRD</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      case 'balances':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Student Balances</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Student</th>
                  <th className="px-4 py-2 border">Student ID</th>
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Total Billed</th>
                  <th className="px-4 py-2 border">Total Paid</th>
                  <th className="px-4 py-2 border">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((student) => (
                    <tr key={student.student_id}>
                      <td className="px-4 py-2 border">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-2 border">{student.student_number}</td>
                      <td className="px-4 py-2 border">{student.class_name}</td>
                      <td className="px-4 py-2 border">{student.total_billed?.toLocaleString()} LRD</td>
                      <td className="px-4 py-2 border">{student.total_paid?.toLocaleString()} LRD</td>
                      <td className="px-4 py-2 border font-bold text-red-600">{student.balance_due?.toLocaleString()} LRD</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-2 border text-center">No student balances found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'daily':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Daily Payments</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Method</th>
                  <th className="px-4 py-2 border">Transactions</th>
                  <th className="px-4 py-2 border">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 border capitalize">{payment.payment_method}</td>
                      <td className="px-4 py-2 border">{payment.transaction_count}</td>
                      <td className="px-4 py-2 border">{payment.total_amount?.toLocaleString()} {payment.currency}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 border text-center">No daily payments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'monthly':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Monthly Revenue</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Year</th>
                  <th className="px-4 py-2 border">Month</th>
                  <th className="px-4 py-2 border">Transactions</th>
                  <th className="px-4 py-2 border">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((revenue, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{revenue.year}</td>
                      <td className="px-4 py-2 border">{revenue.month}</td>
                      <td className="px-4 py-2 border">{revenue.transaction_count}</td>
                      <td className="px-4 py-2 border">{revenue.total_amount?.toLocaleString()} {revenue.currency}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 border text-center">No monthly revenue data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'outstanding':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Outstanding Fees</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Fee Type</th>
                  <th className="px-4 py-2 border">Academic Year</th>
                  <th className="px-4 py-2 border">Student Count</th>
                  <th className="px-4 py-2 border">Total Amount</th>
                  <th className="px-4 py-2 border">Pending</th>
                  <th className="px-4 py-2 border">Partial</th>
                  <th className="px-4 py-2 border">Paid</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((fee, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border capitalize">{fee.fee_type}</td>
                      <td className="px-4 py-2 border">{fee.academic_year}</td>
                      <td className="px-4 py-2 border">{fee.student_count}</td>
                      <td className="px-4 py-2 border">{fee.total_amount?.toLocaleString()} {fee.currency}</td>
                      <td className="px-4 py-2 border">{fee.pending_amount?.toLocaleString()}</td>
                      <td className="px-4 py-2 border">{fee.partial_amount?.toLocaleString()}</td>
                      <td className="px-4 py-2 border">{fee.paid_amount?.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 border text-center">No outstanding fees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'history':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Payment History</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Student</th>
                  <th className="px-4 py-2 border">Invoice #</th>
                  <th className="px-4 py-2 border">Method</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Reference</th>
                  <th className="px-4 py-2 border">Received By</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-2 border">{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 border">{payment.student_first_name} {payment.student_last_name}</td>
                      <td className="px-4 py-2 border">{payment.invoice_number || 'N/A'}</td>
                      <td className="px-4 py-2 border capitalize">{payment.payment_method}</td>
                      <td className="px-4 py-2 border">{payment.amount?.toLocaleString()} {payment.currency}</td>
                      <td className="px-4 py-2 border">{payment.payment_reference || 'N/A'}</td>
                      <td className="px-4 py-2 border">{payment.received_by_first_name} {payment.received_by_last_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 border text-center">No payment history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-lg sm:text-xl font-bold">Financial Reports</h1>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
