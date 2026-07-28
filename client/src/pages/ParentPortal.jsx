import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, Users, BookOpen, DollarSign, Calendar, MessageSquare, Bell, TrendingUp, AlertCircle } from 'lucide-react';

export default function ParentPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({
    profile: null,
    academicProgress: null,
    attendance: null,
    grades: null,
    fees: null,
    payments: null,
    announcements: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await axios.get('/parents/my-children');
      setChildren(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedChild(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchChildData = async (childId) => {
    setLoading(true);
    try {
      const [profileRes, progressRes, attendanceRes, gradesRes, feesRes, paymentsRes, announcementsRes, messagesRes] = await Promise.all([
        axios.get(`/students/${childId}`),
        axios.get(`/academic-progress/student/${childId}`),
        axios.get(`/attendance/student/${childId}`),
        axios.get(`/student-grades/student/${childId}`),
        axios.get(`/fees/student/${childId}`),
        axios.get(`/payments/student/${childId}`),
        axios.get('/announcements'),
        axios.get('/messages')
      ]);

      setChildData({
        profile: profileRes.data.data,
        academicProgress: progressRes.data.data[0] || null,
        attendance: attendanceRes.data.data,
        grades: gradesRes.data.data,
        fees: feesRes.data.data,
        payments: paymentsRes.data.data,
        announcements: announcementsRes.data.data,
        messages: messagesRes.data.data.filter(m => m.receiver_id === user.id)
      });
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (teacherId) => {
    navigate('/messages/compose', { state: { receiverId: teacherId } });
  };

  const getPerformanceLevelColor = (level) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceLevelLabel = (level) => {
    switch (level) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'satisfactory': return 'Satisfactory';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'N/A';
    }
  };

  if (loading && !selectedChild) return <div className="p-6">Loading...</div>;

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
            <h1 className="text-lg sm:text-xl font-bold">Parent Portal</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Child Selection */}
        {children.length > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedChild ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No children linked to your account</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'academic' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                Academic Progress
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'attendance' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'fees' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                Fees & Payments
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'messages' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                Messages
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Child Profile */}
                {childData.profile && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Child Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{childData.profile.first_name} {childData.profile.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Class</p>
                        <p className="font-medium">{childData.profile.class_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Division</p>
                        <p className="font-medium">{childData.profile.division_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Summary */}
                {childData.academicProgress && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">GPA</p>
                        <p className="text-2xl font-bold text-blue-600">{childData.academicProgress.gpa || 'N/A'}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Attendance</p>
                        <p className="text-2xl font-bold text-green-600">{childData.academicProgress.attendance_percentage || 0}%</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Assignments</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {childData.academicProgress.completed_assignments || 0}/{childData.academicProgress.total_assignments || 0}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${getPerformanceLevelColor(childData.academicProgress.performance_level)}`}>
                        <p className="text-sm font-medium">Performance</p>
                        <p className="text-xl font-bold">{getPerformanceLevelLabel(childData.academicProgress.performance_level)}</p>
                      </div>
                    </div>
                    {childData.academicProgress.teacher_comments && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Teacher Comments</p>
                        <p className="text-gray-600">{childData.academicProgress.teacher_comments}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fee Balance */}
                {childData.fees && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Fee Balance
                    </h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Outstanding Balance</p>
                        <p className="text-3xl font-bold text-red-600">
                          ${childData.fees.outstanding?.toLocaleString() || 0}
                        </p>
                      </div>
                      {childData.fees.outstanding > 0 && (
                        <button
                          onClick={() => navigate('/payments')}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Make Payment
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Announcements */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Announcements
                  </h2>
                  {childData.announcements.length === 0 ? (
                    <p className="text-gray-500">No recent announcements</p>
                  ) : (
                    <div className="space-y-3">
                      {childData.announcements.slice(0, 3).map((announcement) => (
                        <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                          <h3 className="font-medium">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(announcement.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Progress
                </h2>
                {!childData.academicProgress ? (
                  <p className="text-gray-500">No academic progress data available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">GPA</p>
                        <p className="text-2xl font-bold text-blue-600">{childData.academicProgress.gpa || 'N/A'}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Attendance</p>
                        <p className="text-2xl font-bold text-green-600">{childData.academicProgress.attendance_percentage || 0}%</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Assignments Completed</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {childData.academicProgress.completed_assignments || 0}/{childData.academicProgress.total_assignments || 0}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Average Exam Score</p>
                        <p className="text-2xl font-bold text-orange-600">{childData.academicProgress.average_exam_score || 'N/A'}</p>
                      </div>
                    </div>
                    {childData.academicProgress.teacher_comments && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Teacher Comments</p>
                        <p className="text-gray-600">{childData.academicProgress.teacher_comments}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Record
                </h2>
                {!childData.attendance || childData.attendance.length === 0 ? (
                  <p className="text-gray-500">No attendance data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childData.attendance.slice(0, 20).map((record) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-sm ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{record.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-6">
                {/* Fee Balance */}
                {childData.fees && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Fee Balance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Fees</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${childData.fees.total?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${childData.fees.paid?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="text-2xl font-bold text-red-600">
                          ${childData.fees.outstanding?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    {childData.fees.outstanding > 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Payment Reminder: You have an outstanding balance of ${childData.fees.outstanding.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment History */}
                {childData.payments && childData.payments.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Payment History</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Method</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {childData.payments.map((payment) => (
                            <tr key={payment.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-medium">${payment.amount?.toLocaleString() || 0}</td>
                              <td className="py-3 px-4">{payment.payment_method || 'N/A'}</td>
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
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Teacher Messages
                </h2>
                {childData.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No messages from teachers</p>
                    <button
                      onClick={() => navigate('/messages/compose')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Send Message to Teacher
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {childData.messages.map((message) => (
                      <div key={message.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/messages/${message.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{message.sender_name || 'Teacher'}</h3>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/messages/compose')}
                      className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Send New Message
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
