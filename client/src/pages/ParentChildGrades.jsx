import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { ArrowLeft, BookOpen, TrendingUp } from 'lucide-react'

function ParentChildGrades() {
  const { childId } = useParams()
  const [grades, setGrades] = useState([])
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, childRes] = await Promise.all([
          axios.get(`/student-grades?student_id=${childId}`),
          axios.get(`/students/${childId}`)
        ])
        setGrades(gradesRes.data.data || [])
        setChild(childRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch grades data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [childId])

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + (grade.score || 0), 0)
    return Math.round(sum / grades.length)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const averageGrade = calculateAverageGrade()

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
            <h1 className="text-lg sm:text-xl font-bold">Grades & Progress</h1>
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
              {child.first_name} {child.last_name}'s Academic Performance
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Average Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{averageGrade}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Total Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{grades.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {grades.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No grade records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>{grade.subject_name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{grade.grade || 'N/A'}</TableCell>
                      <TableCell>{grade.score || 0}%</TableCell>
                      <TableCell>{grade.term || 'N/A'}</TableCell>
                      <TableCell>
                        {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ParentChildGrades
