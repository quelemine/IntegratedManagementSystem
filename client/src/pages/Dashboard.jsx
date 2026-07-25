import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [school, setSchool] = useState(null)
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

    fetchSchool()
  }, [user, navigate])

  if (!user || !school) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">{school.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.first_name} {user.last_name}</span>
              <button
                onClick={() => navigate('/notifications')}
                className="relative px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
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
          </div>
        </div>

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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Financial Management</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/fees')}
              className="bg-emerald-600 text-white px-4 py-3 rounded-md hover:bg-emerald-700"
            >
              Fees
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="bg-violet-600 text-white px-4 py-3 rounded-md hover:bg-violet-700"
            >
              Invoices
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="bg-fuchsia-600 text-white px-4 py-3 rounded-md hover:bg-fuchsia-700"
            >
              Payments
            </button>
            <button
              onClick={() => navigate('/financial-reports')}
              className="bg-slate-600 text-white px-4 py-3 rounded-md hover:bg-slate-700"
            >
              Reports
            </button>
          </div>
        </div>

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
            <button
              onClick={() => navigate('/announcements')}
              className="bg-teal-600 text-white px-4 py-3 rounded-md hover:bg-teal-700"
            >
              Announcements
            </button>
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
