import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Fees() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const tabs = [
    { id: 'categories', label: 'Fee Categories' },
    { id: 'tuition', label: 'Tuition Structures' },
    { id: 'class-fees', label: 'Class Fees' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'scholarships', label: 'Scholarships' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      switch (activeTab) {
        case 'categories':
          endpoint = '/fees/categories';
          break;
        case 'tuition':
          endpoint = '/fees/tuition-structures';
          break;
        case 'class-fees':
          endpoint = '/fees/class-fees';
          break;
        case 'discounts':
          endpoint = '/fees/discounts';
          break;
        case 'scholarships':
          endpoint = '/fees/scholarships';
          break;
        default:
          endpoint = '/fees/categories';
      }

      const response = await axios.get(endpoint);
      setData(response.data.success ? response.data.data : response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.error || 'Failed to load data. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const response = await axios.post('/fees/seed');
      setSeedMessage(response.data.message || 'Data seeded successfully');
      fetchData();
    } catch (error) {
      setSeedMessage(error.response?.data?.error || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6">Loading...</div>;
    
    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>No data found. Click "Seed Sample Data" to add sample financial data.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'categories':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Fee Categories</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.description}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'tuition':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Tuition Structures</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Grade</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Currency</th>
                  <th className="px-4 py-2 border">Academic Year</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.grade_name}</td>
                    <td className="px-4 py-2 border">{(item?.amount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{item.currency}</td>
                    <td className="px-4 py-2 border">{item.academic_year}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'class-fees':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Class Fees</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Fee Category</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Currency</th>
                  <th className="px-4 py-2 border">Academic Year</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.class_name}</td>
                    <td className="px-4 py-2 border">{item.fee_category_name}</td>
                    <td className="px-4 py-2 border">{(item?.amount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{item.currency}</td>
                    <td className="px-4 py-2 border">{item.academic_year}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'discounts':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Discounts</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Value</th>
                  <th className="px-4 py-2 border">Applicable To</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border capitalize">{item.discount_type}</td>
                    <td className="px-4 py-2 border">
                      {item.discount_type === 'percentage' ? `${item.discount_value}%` : (item?.discount_value ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border capitalize">{item.applicable_to}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'scholarships':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Scholarships</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Coverage</th>
                  <th className="px-4 py-2 border">Max Amount</th>
                  <th className="px-4 py-2 border">Academic Year</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border capitalize">{item.scholarship_type}</td>
                    <td className="px-4 py-2 border">{item.coverage_percentage}%</td>
                    <td className="px-4 py-2 border">{(item?.max_amount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{item.academic_year}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
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
              <h1 className="text-lg sm:text-xl font-bold">Fee Management</h1>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="px-3 py-2 sm:px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {seeding ? 'Seeding...' : 'Seed'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {seedMessage && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className={`p-3 rounded ${seedMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {seedMessage}
          </div>
        </div>
      )}
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
