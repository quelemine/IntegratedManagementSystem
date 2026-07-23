import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react'

function Quizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    duration: '',
    total_questions: '',
    total_points: '',
    start_date: '',
    end_date: '',
    shuffle_questions: false,
    show_results_immediately: false
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
        const [quizzesRes, coursesRes] = await Promise.all([
          axios.get('/api/quizzes', { 
            headers: { Authorization: `Bearer ${token}` },
            params: { course_id: filterCourse || undefined }
          }),
          axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setQuizzes(quizzesRes.data.data)
        setCourses(coursesRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, filterCourse])

  const handleCreate = () => {
    setEditingQuiz(null)
    setFormData({
      course_id: '',
      title: '',
      description: '',
      duration: '',
      total_questions: '',
      total_points: '',
      start_date: '',
      end_date: '',
      shuffle_questions: false,
      show_results_immediately: false
    })
    setIsModalOpen(true)
  }

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      course_id: quiz.course_id,
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration || '',
      total_questions: quiz.total_questions || '',
      total_points: quiz.total_points || '',
      start_date: quiz.start_date ? quiz.start_date.split('T')[0] : '',
      end_date: quiz.end_date ? quiz.end_date.split('T')[0] : '',
      shuffle_questions: quiz.shuffle_questions || false,
      show_results_immediately: quiz.show_results_immediately || false
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuizzes(quizzes.filter(q => q.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete quiz')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingQuiz) {
        await axios.put(`/api/quizzes/${editingQuiz.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, ...formData } : q))
      } else {
        await axios.post('/api/quizzes', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { course_id: filterCourse || undefined }
        })
        setQuizzes(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save quiz')
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-xl font-bold">Quizzes</h1>
            {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
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

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.course_name || 'N/A'}</TableCell>
                  <TableCell>{quiz.teacher_first_name} {quiz.teacher_last_name}</TableCell>
                  <TableCell>{quiz.duration ? `${quiz.duration} min` : 'N/A'}</TableCell>
                  <TableCell>{quiz.total_questions || 'N/A'}</TableCell>
                  <TableCell>{quiz.total_points || 'N/A'}</TableCell>
                  <TableCell>
                    {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(quiz)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredQuizzes.length === 0 && (
            <div className="text-center py-8 text-gray-500">No quizzes found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Quiz title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Quiz description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="total_questions">Total Questions</Label>
              <Input
                id="total_questions"
                type="number"
                value={formData.total_questions}
                onChange={(e) => setFormData({ ...formData, total_questions: e.target.value })}
                placeholder="20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total_points">Total Points</Label>
            <Input
              id="total_points"
              type="number"
              value={formData.total_points}
              onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
              placeholder="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="shuffle_questions"
              checked={formData.shuffle_questions}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="show_results_immediately"
              checked={formData.show_results_immediately}
              onChange={(e) => setFormData({ ...formData, show_results_immediately: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="show_results_immediately">Show Results Immediately</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingQuiz ? 'Update' : 'Create'} Quiz
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Quizzes
