import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, BookOpen, TrendingUp, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';

export default function VicePrincipalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'vice_principal' || user?.role === 'admin' || user?.role === 'super_admin') {
      fetchVicePrincipalData();
    }
  }, [user]);

  const fetchVicePrincipalData = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get('/dashboard/admin'),
        axios.get('/audit', { params: { limit: 10 } })
      ]);

      setStats(statsRes.data.data);
      setRecentActivity(activityRes.data.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching vice principal data:', error);
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
            <h1 className="text-lg sm:text-xl font-bold">Vice Principal Dashboard (Instruction)</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.totalStudents ?? 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.totalTeachers ?? 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalClasses ?? 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Academic Performance</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.averageGrade ?? 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Academic Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Academic Performance
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-gray-700">Average Grade</span>
                <span className="font-bold text-green-600">{stats?.averageGrade ?? 0}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-gray-700">Pass Rate</span>
                <span className="font-bold text-blue-600">{stats?.passRate ?? 0}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-gray-700">Honor Roll Students</span>
                <span className="font-bold text-purple-600">{stats?.honorRoll ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Attendance Overview (Last 30 Days)
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="text-sm font-medium">{stats?.attendanceStats?.present ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="text-sm font-medium">{stats?.attendanceStats?.absent ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: '15%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Late</span>
                  <span className="text-sm font-medium">{stats?.attendanceStats?.late ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: '10%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All
            </button>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                    <th className="text-left py-3 px-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.slice(0, 5).map((activity) => (
                    <tr key={activity.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(activity.timestamp).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{activity.first_name} {activity.last_name}</td>
                      <td className="py-3 px-4">{activity.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{activity.details}</td>
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
