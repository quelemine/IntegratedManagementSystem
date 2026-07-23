import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Schools() {
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const fetchSchool = async () => {
      try {
        const response = await axios.get('/api/schools/my-school', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSchool(response.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch school')
      } finally {
        setLoading(false)
      }
    }

    fetchSchool()
  }, [navigate])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-bold">School Information</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {school && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">{school.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Code:</span>
                    <span className="ml-2 text-gray-900">{school.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2 text-gray-900">{school.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 text-gray-900">{school.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-900">{school.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Branding</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Primary:</span>
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: school.primary_color }}></div>
                    <span className="ml-2 text-gray-900">{school.primary_color}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Secondary:</span>
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: school.secondary_color }}></div>
                    <span className="ml-2 text-gray-900">{school.secondary_color}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Accent:</span>
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: school.accent_color }}></div>
                    <span className="ml-2 text-gray-900">{school.accent_color}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Settings</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Currency:</span>
                    <span className="ml-2 text-gray-900">{school.settings?.currency || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Timezone:</span>
                    <span className="ml-2 text-gray-900">{school.settings?.timezone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Academic Year:</span>
                    <span className="ml-2 text-gray-900">{school.settings?.academic_year || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Schools
