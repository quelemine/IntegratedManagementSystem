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
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react'

function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    total_points: ''
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
        const [assignmentsRes, coursesRes] = await Promise.all([
          axios.get('/api/assignments', { 
            headers: { Authorization: `Bearer ${token}` },
            params: { course_id: filterCourse || undefined }
          }),
          axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setAssignments(assignmentsRes.data.data)
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
    setEditingAssignment(null)
    setFormData({
      course_id: '',
      title: '',
      description: '',
      due_date: '',
      total_points: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      course_id: assignment.course_id,
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      total_points: assignment.total_points || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssignments(assignments.filter(a => a.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete assignment')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingAssignment) {
        await axios.put(`/api/assignments/${editingAssignment.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, ...formData } : a))
      } else {
        await axios.post('/api/assignments', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/assignments', {
          headers: { Authorization: `Bearer ${token}` },
          params: { course_id: filterCourse || undefined }
        })
        setAssignments(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save assignment')
    }
  }

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl font-bold">Assignments</h1>
            {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
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
                <TableHead>Due Date</TableHead>
                <TableHead>Total Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.course_name || 'N/A'}</TableCell>
                  <TableCell>{assignment.teacher_first_name} {assignment.teacher_last_name}</TableCell>
                  <TableCell>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{assignment.total_points || 'N/A'}</TableCell>
                  <TableCell>
                    {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(assignment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAssignments.length === 0 && (
            <div className="text-center py-8 text-gray-500">No assignments found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
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
              placeholder="Assignment title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assignment description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAssignment ? 'Update' : 'Create'} Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Assignments
