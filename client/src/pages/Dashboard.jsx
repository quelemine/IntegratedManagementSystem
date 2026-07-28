import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Users, DollarSign, TrendingUp, BookOpen, CheckCircle, Clock } from 'lucide-react'
import NotificationDropdown from '../components/NotificationDropdown'

function Dashboard() {
  const [school, setSchool] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const { user, logout, unreadCount } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    // Fetch school data
    const fetchSchool = async () => {
      try {
        const response = await axios.get('/schools/my-school')
        setSchool(response.data.data)
      } catch (err) {
        console.error('Failed to fetch school:', err)
      }
    }

    // Fetch analytics based on role
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true)
      try {
        let endpoint = ''
        if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') {
          endpoint = '/dashboard/admin'
        } else if (user.role === 'teacher') {
          endpoint = '/dashboard/teacher'
        } else if (user.role === 'student') {
          endpoint = '/dashboard/student'
        } else if (user.role === 'parent') {
          endpoint = '/dashboard/parent'
        }

        if (endpoint) {
          const response = await axios.get(endpoint)
          setAnalytics(response.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    fetchSchool()
    fetchAnalytics()
  }, [user, navigate])

  if (!user || !school) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left truncate w-full sm:w-auto">{school.name}</h1>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-gray-700 text-sm sm:text-base">{user.first_name} {user.last_name}</span>
              <NotificationDropdown />
              <button
                onClick={logout}
                className="bg-red-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-red-700 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">School</h3>
            <p className="text-gray-600">{school.name}</p>
            <p className="text-sm text-gray-500">{school.code}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Your Role</h3>
            <p className="text-gray-600 capitalize">{user.role}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              View Profile →
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {!loadingAnalytics && analytics && (
          <div className="mb-8">
            {/* Admin Analytics */}
            {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Students</p>
                      <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Teachers</p>
                      <p className="text-2xl font-bold">{analytics.totalTeachers}</p>
                    </div>
                    <BookOpen className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-purple-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Parents</p>
                      <p className="text-2xl font-bold">{analytics.totalParents}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-emerald-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Revenue</p>
                      <p className="text-2xl font-bold">${(analytics?.totalRevenue ?? 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-red-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Outstanding</p>
                      <p className="text-2xl font-bold">${(analytics?.outstandingBalances ?? 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-cyan-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Attendance Rate</p>
                      <p className="text-2xl font-bold">{analytics.attendanceStats.attendanceRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Analytics */}
            {user.role === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Assigned Classes</p>
                      <p className="text-2xl font-bold">{analytics.assignedClasses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Students</p>
                      <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-orange-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Pending Grading</p>
                      <p className="text-2xl font-bold">{analytics.pendingGrading}</p>
                    </div>
                    <Clock className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* Student Analytics */}
            {user.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Average Grade</p>
                      <p className="text-2xl font-bold">{analytics.academicProgress.averageGrade}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Attendance</p>
                      <p className="text-2xl font-bold">{analytics.attendance.percentage}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-red-500 text-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Fee Balance</p>
                      <p className="text-2xl font-bold">${(analytics?.feeBalance?.outstanding ?? 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* Parent Analytics */}
            {user.role === 'parent' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Children's Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.children.map((child) => (
                    <div key={child.id} className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-2">{child.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Grade:</span>
                          <span className="font-medium">{child.averageGrade}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Attendance:</span>
                          <span className="font-medium">{child.attendancePercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Outstanding:</span>
                          <span className="font-medium text-red-600">${(child?.outstandingBalance ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Student Only - Academic Progress */}
        {user.role === 'student' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Academic Progress</h3>
            <button
              onClick={() => navigate('/academic-progress')}
              className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 w-full"
            >
              View Academic Progress
            </button>
          </div>
        )}

        {/* Parent Only - Parent Portal */}
        {user.role === 'parent' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Parent Portal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/parent-dashboard')}
                className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700"
              >
                View Children's Dashboard
              </button>
              <button
                onClick={() => navigate('/parent-portal')}
                className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
              >
                View Children's Progress
              </button>
            </div>
          </div>
        )}

        {/* Admin/Principal Only - User & School Management */}
        {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">User & School Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/students')}
                className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700"
              >
                Students
              </button>
              <button
                onClick={() => navigate('/teachers')}
                className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700"
              >
                Teachers
              </button>
              <button
                onClick={() => navigate('/parents')}
                className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700"
              >
                Parents
              </button>
              <button
                onClick={() => navigate('/parent-student-relationships')}
                className="bg-pink-600 text-white px-4 py-3 rounded-md hover:bg-pink-700"
              >
                Parent-Student Links
              </button>
              <button
                onClick={() => navigate('/classes')}
                className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700"
              >
                Classes
              </button>
              <button
                onClick={() => navigate('/divisions')}
                className="bg-pink-600 text-white px-4 py-3 rounded-md hover:bg-pink-700"
              >
                Divisions
              </button>
              <button
                onClick={() => navigate('/grades')}
                className="bg-teal-600 text-white px-4 py-3 rounded-md hover:bg-teal-700"
              >
                Grades
              </button>
              <button
                onClick={() => navigate('/schools')}
                className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
              >
                Schools
              </button>
              <button
                onClick={() => navigate('/users')}
                className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700"
              >
                Users
              </button>
              <button
                onClick={() => navigate('/audit-logs')}
                className="bg-gray-800 text-white px-4 py-3 rounded-md hover:bg-gray-900"
              >
                Audit Logs
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="bg-indigo-800 text-white px-4 py-3 rounded-md hover:bg-indigo-900"
              >
                Documents
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="bg-pink-800 text-white px-4 py-3 rounded-md hover:bg-pink-900"
              >
                Reports
              </button>
            </div>
          </div>
        )}

        {/* Teacher Only - Academic Management */}
        {(user.role === 'teacher' || user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Academic Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/attendance')}
                className="bg-cyan-600 text-white px-4 py-3 rounded-md hover:bg-cyan-700"
              >
                Attendance
              </button>
              <button
                onClick={() => navigate('/assignments')}
                className="bg-amber-600 text-white px-4 py-3 rounded-md hover:bg-amber-700"
              >
                Assignments
              </button>
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-lime-600 text-white px-4 py-3 rounded-md hover:bg-lime-700"
              >
                Quizzes
              </button>
              <button
                onClick={() => navigate('/grade-report')}
                className="bg-rose-600 text-white px-4 py-3 rounded-md hover:bg-rose-700"
              >
                Grade Reports
              </button>
            </div>
          </div>
        )}

        {/* Teacher Only - Grade Entry */}
        {user.role === 'teacher' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Grade Entry</h3>
            <button
              onClick={() => navigate('/grade-entry')}
              className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 w-full"
            >
              Enter Student Grades
            </button>
          </div>
        )}

        {/* Admin/Principal Only - Academic Reports */}
        {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'principal') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Academic Reports</h3>
            <button
              onClick={() => navigate('/academic-reports')}
              className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 w-full"
            >
              View Academic Reports
            </button>
          </div>
        )}

        {/* Teacher Only - Documents */}
        {user.role === 'teacher' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">My Documents</h3>
            <button
              onClick={() => navigate('/documents')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
            >
              Manage Documents
            </button>
          </div>
        )}

        {/* Admin/Principal Only - Financial Management */}
        {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Financial Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/fees')}
                className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700"
              >
                Fees
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700"
              >
                Invoices
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700"
              >
                Payments
              </button>
              <button
                onClick={() => navigate('/finance-dashboard')}
                className="bg-yellow-600 text-white px-4 py-3 rounded-md hover:bg-yellow-700"
              >
                Finance Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Student/Parent - View Fees */}
        {(user.role === 'student' || user.role === 'parent') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/fees')}
                className="bg-emerald-600 text-white px-4 py-3 rounded-md hover:bg-emerald-700"
              >
                My Fees
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="bg-violet-600 text-white px-4 py-3 rounded-md hover:bg-violet-700"
              >
                My Invoices
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="bg-fuchsia-600 text-white px-4 py-3 rounded-md hover:bg-fuchsia-700"
              >
                My Payments
              </button>
            </div>
          </div>
        )}

        {/* Student Only - Academic Progress */}
        {user.role === 'student' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Academic Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/grade-report')}
                className="bg-rose-600 text-white px-4 py-3 rounded-md hover:bg-rose-700"
              >
                My Grades
              </button>
              <button
                onClick={() => navigate('/assignments')}
                className="bg-amber-600 text-white px-4 py-3 rounded-md hover:bg-amber-700"
              >
                My Assignments
              </button>
              <button
                onClick={() => navigate('/attendance')}
                className="bg-cyan-600 text-white px-4 py-3 rounded-md hover:bg-cyan-700"
              >
                My Attendance
              </button>
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-lime-600 text-white px-4 py-3 rounded-md hover:bg-lime-700"
              >
                My Quizzes
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
              >
                My Documents
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="bg-pink-600 text-white px-4 py-3 rounded-md hover:bg-pink-700"
              >
                My Reports
              </button>
            </div>
          </div>
        )}

        {/* All Roles - Communication */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Communication</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/inbox')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700"
            >
              Inbox
            </button>
            <button
              onClick={() => navigate('/messages/compose')}
              className="bg-sky-600 text-white px-4 py-3 rounded-md hover:bg-sky-700"
            >
              Compose
            </button>
            {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
              <button
                onClick={() => navigate('/announcements')}
                className="bg-teal-600 text-white px-4 py-3 rounded-md hover:bg-teal-700"
              >
                Announcements
              </button>
            )}
            <button
              onClick={() => navigate('/notifications')}
              className="bg-cyan-600 text-white px-4 py-3 rounded-md hover:bg-cyan-700"
            >
              Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
