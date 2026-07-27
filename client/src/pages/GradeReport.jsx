import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react'

function GradeReport() {
  const [grades, setGrades] = useState([])
  const [report, setReport] = useState(null)
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStudent, setFilterStudent] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterTerm, setFilterTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    assignment_id: '',
    quiz_id: '',
    grade_type: '',
    score: '',
    total_points: '',
    letter_grade: '',
    remarks: '',
    term: '',
    academic_year: ''
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const [gradesRes, studentsRes, coursesRes] = await Promise.all([
          axios.get('/api/student-grades', { 
            headers: { Authorization: `Bearer ${token}` },
            params: { 
              student_id: filterStudent || undefined,
              course_id: filterCourse || undefined,
              term: filterTerm || undefined,
              academic_year: filterYear || undefined
            }
          }),
          axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setGrades(gradesRes.data.data)
        setStudents(studentsRes.data.data)
        setCourses(coursesRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, filterStudent, filterCourse, filterTerm, filterYear])

  const fetchReport = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get('/api/student-grades/report', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          student_id: filterStudent || undefined,
          term: filterTerm || undefined,
          academic_year: filterYear || undefined
        }
      })
      setReport(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report')
    }
  }

  const handleCreate = () => {
    setEditingGrade(null)
    setFormData({
      student_id: '',
      course_id: '',
      assignment_id: '',
      quiz_id: '',
      grade_type: '',
      score: '',
      total_points: '',
      letter_grade: '',
      remarks: '',
      term: '',
      academic_year: '2024-2025'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setFormData({
      student_id: grade.student_id,
      course_id: grade.course_id,
      assignment_id: grade.assignment_id || '',
      quiz_id: grade.quiz_id || '',
      grade_type: grade.grade_type,
      score: grade.score || '',
      total_points: grade.total_points || '',
      letter_grade: grade.letter_grade || '',
      remarks: grade.remarks || '',
      term: grade.term || '',
      academic_year: grade.academic_year || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this grade?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/student-grades/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGrades(grades.filter(g => g.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete grade')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingGrade) {
        await axios.put(`/api/student-grades/${editingGrade.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setGrades(grades.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g))
      } else {
        await axios.post('/api/student-grades', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/student-grades', {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            student_id: filterStudent || undefined,
            course_id: filterCourse || undefined,
            term: filterTerm || undefined,
            academic_year: filterYear || undefined
          }
        })
        setGrades(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save grade')
    }
  }

  const filteredGrades = grades.filter(grade =>
    grade.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${grade.first_name} ${grade.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const gradeTypeColors = {
    assignment: 'bg-blue-100 text-blue-800',
    quiz: 'bg-purple-100 text-purple-800',
    exam: 'bg-red-100 text-red-800',
    project: 'bg-green-100 text-green-800'
  }

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
            <h1 className="text-xl font-bold">Grade Reports</h1>
            {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Grade
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <Select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <SelectItem value="">All Students</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.first_name} {student.last_name}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <SelectItem value="">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            >
              <SelectItem value="">All Terms</SelectItem>
              <SelectItem value="Fall">Fall</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
            </Select>
          </div>
          <div>
            <Input
              placeholder="Academic Year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <Button onClick={fetchReport} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {report && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grade Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">By Course</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_course.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.course_name}</TableCell>
                          <TableCell>{item.average_score?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>{item.average_percentage || 'N/A'}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Overall Statistics</h3>
                  <div className="space-y-2">
                    <p>Average Score: {report.overall?.overall_average_score?.toFixed(2) || 'N/A'}</p>
                    <p>Average Total Points: {report.overall?.overall_average_total_points?.toFixed(2) || 'N/A'}</p>
                    <p>Overall Percentage: {report.overall?.overall_percentage || 'N/A'}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Letter Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.first_name} {grade.last_name}</TableCell>
                  <TableCell>{grade.course_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${gradeTypeColors[grade.grade_type] || 'bg-gray-100 text-gray-800'}`}>
                      {grade.grade_type}
                    </span>
                  </TableCell>
                  <TableCell>{grade.score || 'N/A'}</TableCell>
                  <TableCell>{grade.total_points || 'N/A'}</TableCell>
                  <TableCell className="font-bold">{grade.letter_grade || 'N/A'}</TableCell>
                  <TableCell>{grade.term || 'N/A'}</TableCell>
                  <TableCell>
                    {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(grade)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(grade.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">No grades found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGrade ? 'Edit Grade' : 'Add Grade'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student_id">Student</Label>
            <Select
              id="student_id"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Student</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.first_name} {student.last_name}</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="course_id">Course</Label>
            <Select
              id="course_id"
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Course</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="grade_type">Grade Type</Label>
            <Select
              id="grade_type"
              value={formData.grade_type}
              onChange={(e) => setFormData({ ...formData, grade_type: e.target.value })}
              required
            >
              <SelectItem value="">Select Type</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
                placeholder="85"
              />
            </div>
            <div>
              <Label htmlFor="total_points">Total Points</Label>
              <Input
                id="total_points"
                type="number"
                value={formData.total_points}
                onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                required
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="letter_grade">Letter Grade</Label>
              <Input
                id="letter_grade"
                value={formData.letter_grade}
                onChange={(e) => setFormData({ ...formData, letter_grade: e.target.value })}
                placeholder="A"
              />
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select
                id="term"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              >
                <SelectItem value="">Select Term</SelectItem>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="academic_year">Academic Year</Label>
            <Input
              id="academic_year"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2024-2025"
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Optional remarks"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingGrade ? 'Update' : 'Add'} Grade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default GradeReport
