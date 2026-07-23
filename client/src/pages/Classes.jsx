import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

function Classes() {
  const [classes, setClasses] = useState([])
  const [grades, setGrades] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    grade_id: '',
    name: '',
    homeroom_teacher_id: '',
    capacity: '',
    academic_year: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const [classesRes, gradesRes, teachersRes] = await Promise.all([
          axios.get('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/grades', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/teachers', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setClasses(classesRes.data.data)
        setGrades(gradesRes.data.data)
        setTeachers(teachersRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleCreate = () => {
    setEditingClass(null)
    setFormData({
      grade_id: '',
      name: '',
      homeroom_teacher_id: '',
      capacity: '',
      academic_year: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setFormData({
      grade_id: cls.grade_id || '',
      name: cls.name || '',
      homeroom_teacher_id: cls.homeroom_teacher_id || '',
      capacity: cls.capacity || '',
      academic_year: cls.academic_year || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClasses(classes.filter(c => c.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete class')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingClass) {
        await axios.put(`/api/classes/${editingClass.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...formData } : c))
      } else {
        await axios.post('/api/classes', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/classes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setClasses(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save class')
    }
  }

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl font-bold">Classes</h1>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by class name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Homeroom Teacher</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>{cls.grade_name || 'N/A'}</TableCell>
                  <TableCell>{cls.homeroom_teacher_name || 'N/A'}</TableCell>
                  <TableCell>{cls.capacity || 'N/A'}</TableCell>
                  <TableCell>{cls.academic_year || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(cls)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cls.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClasses.length === 0 && (
            <div className="text-center py-8 text-gray-500">No classes found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class' : 'Add Class'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="grade_id">Grade</Label>
            <Select
              id="grade_id"
              value={formData.grade_id}
              onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Grade</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Class A, Class B"
            />
          </div>

          <div>
            <Label htmlFor="homeroom_teacher_id">Homeroom Teacher</Label>
            <Select
              id="homeroom_teacher_id"
              value={formData.homeroom_teacher_id}
              onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value })}
            >
              <SelectItem value="">Select Teacher</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingClass ? 'Update' : 'Create'} Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Classes
