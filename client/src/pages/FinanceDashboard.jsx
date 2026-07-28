import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, DollarSign, TrendingUp, AlertCircle, Calendar, Download } from 'lucide-react';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'principal') {
      fetchFinanceData();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [statsRes, overdueRes, paymentsRes] = await Promise.all([
        axios.get('/financial-reports/summary'),
        axios.get('/invoices/overdue'),
        axios.get('/payments', { params: { limit: 10 } })
      ]);

      setStats(statsRes.data.data);
      setOverdueInvoices(overdueRes.data.data);
      setRecentPayments(paymentsRes.data.data.slice(0, 10));

      // Generate monthly income data (mock data for now)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      setMonthlyIncome(
        months.map((month, index) => ({
          month,
          income: Math.floor(Math.random() * 50000) + 20000,
          year: currentYear
        }))
      );
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
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
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-bold">Finance Dashboard</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.outstanding_balance?.toLocaleString() || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Fees</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${stats?.paid_fees?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${stats?.monthly_income?.toLocaleString() || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Income Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Income</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyIncome.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(data.income / 70000) * 100}%`,
                      minHeight: '20px'
                    }}
                  />
                  <p className="text-xs mt-2 text-gray-600">{data.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Paid</span>
                  <span className="text-sm font-medium">{stats?.payment_status?.paid || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats?.payment_status?.paid || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Partial</span>
                  <span className="text-sm font-medium">{stats?.payment_status?.partial || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${stats?.payment_status?.partial || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium">{stats?.payment_status?.pending || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${stats?.payment_status?.pending || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Overdue Invoices
            </h2>
            <span className="text-sm text-gray-600">{overdueInvoices.length} overdue</span>
          </div>
          {overdueInvoices.length === 0 ? (
            <p className="text-gray-500">No overdue invoices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium">Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueInvoices.slice(0, 5).map((invoice) => {
                    const daysOverdue = Math.floor((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{invoice.invoice_number}</td>
                        <td className="py-3 px-4">{invoice.student_first_name} {invoice.student_last_name}</td>
                        <td className="py-3 px-4 font-medium">${invoice.total_amount?.toLocaleString()}</td>
                        <td className="py-3 px-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-red-600 font-medium">{daysOverdue} days</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Recent Payments
            </h2>
            <button
              onClick={() => navigate('/payments')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All
            </button>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500">No recent payments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Method</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{payment.student_first_name} {payment.student_last_name}</td>
                      <td className="py-3 px-4 font-medium">${payment.amount?.toLocaleString()}</td>
                      <td className="py-3 px-4">{payment.payment_method}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
