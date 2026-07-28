import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Bell, Calendar } from 'lucide-react'

function ParentChildAnnouncements() {
  const { childId } = useParams()
  const [announcements, setAnnouncements] = useState([])
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, childRes] = await Promise.all([
          axios.get('/announcements'),
          axios.get(`/students/${childId}`)
        ])
        setAnnouncements(announcementsRes.data.data || [])
        setChild(childRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch announcements')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [childId])

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
                onClick={() => navigate('/parent-dashboard')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-bold">School Announcements</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {child && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              School Announcements
            </h2>
            <p className="text-sm text-gray-500">Viewing announcements for {child.first_name} {child.last_name}</p>
          </div>
        )}

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No announcements found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-600" />
                      {announcement.title}
                    </div>
                    {announcement.priority === 'urgent' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Urgent
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                    {announcement.target_audience && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Target Audience: </span>
                        <span className="text-sm font-medium capitalize">{announcement.target_audience}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ParentChildAnnouncements
