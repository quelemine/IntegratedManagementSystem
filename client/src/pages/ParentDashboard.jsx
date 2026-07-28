import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, BookOpen, Calendar, DollarSign, FileText, Bell, User } from 'lucide-react'

function ParentDashboard() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedChild, setSelectedChild] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const fetchChildren = async () => {
      try {
        const response = await axios.get('/parent-student-relationships/my-children')
        setChildren(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedChild(response.data.data[0])
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch children')
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [navigate])

  const handleViewChild = (child) => {
    setSelectedChild(child)
    navigate(`/parent/profile/${child.id}`)
  }

  const handleViewAttendance = (childId) => {
    navigate(`/parent/attendance/${childId}`)
  }

  const handleViewGrades = (childId) => {
    navigate(`/parent/grades/${childId}`)
  }

  const handleViewAssignments = (childId) => {
    navigate(`/parent/assignments/${childId}`)
  }

  const handleViewFees = (childId) => {
    navigate(`/parent/fees/${childId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
            <h1 className="text-lg sm:text-xl font-bold">Parent Dashboard</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Children Linked</h2>
            <p className="text-gray-500">You don't have any children linked to your account yet.</p>
            <p className="text-gray-500">Please contact the school administrator to link your children.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">My Children</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child) => (
                  <Card
                    key={child.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedChild?.id === child.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleViewChild(child)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        {child.first_name} {child.last_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Student ID:</span> {child.student_id || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-500">Class:</span> {child.class_name || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-500">Grade:</span> {child.grade_name || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-500">Division:</span> {child.division_name || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-500">Relationship:</span>{' '}
                          <span className="capitalize">{child.relationship_type}</span>
                          {child.is_primary && <span className="ml-1 text-blue-600">(Primary)</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedChild && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  {selectedChild.first_name} {selectedChild.last_name}'s Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => handleViewAttendance(selectedChild.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View attendance records</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => handleViewGrades(selectedChild.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                        Grades & Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View academic performance</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => handleViewAssignments(selectedChild.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-purple-600" />
                        Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View assignments and submissions</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => handleViewFees(selectedChild.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                        Fees & Payments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View fee invoices and payments</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => navigate(`/parent/announcements/${selectedChild.id}`)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-red-600" />
                        Announcements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View school announcements</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg" onClick={() => navigate(`/parent/profile/${selectedChild.id}`)}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-600" />
                        Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">View child's profile</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ParentDashboard
