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

function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    employee_id: '',
    subjects: '',
    qualification: '',
    experience_years: '',
    hire_date: '',
    salary: '',
    phone: '',
    address: ''
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
        const [teachersRes, usersRes] = await Promise.all([
          axios.get('/api/teachers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users?role=teacher', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setTeachers(teachersRes.data.data)
        setUsers(usersRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleCreate = () => {
    setEditingTeacher(null)
    setFormData({
      user_id: '',
      employee_id: '',
      subjects: '',
      qualification: '',
      experience_years: '',
      hire_date: '',
      salary: '',
      phone: '',
      address: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      user_id: teacher.user_id || '',
      employee_id: teacher.employee_id || '',
      subjects: teacher.subjects || '',
      qualification: teacher.qualification || '',
      experience_years: teacher.experience_years || '',
      hire_date: teacher.hire_date || '',
      salary: teacher.salary || '',
      phone: teacher.phone || '',
      address: teacher.address || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTeachers(teachers.filter(t => t.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete teacher')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingTeacher) {
        await axios.put(`/api/teachers/${editingTeacher.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t))
      } else {
        await axios.post('/api/teachers', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTeachers(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save teacher')
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl font-bold">Teachers</h1>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
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
              placeholder="Search by employee ID or name..."
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
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.employee_id || 'N/A'}</TableCell>
                  <TableCell>{teacher.first_name} {teacher.last_name}</TableCell>
                  <TableCell>{teacher.subjects || 'N/A'}</TableCell>
                  <TableCell>{teacher.qualification || 'N/A'}</TableCell>
                  <TableCell>{teacher.experience_years ? `${teacher.experience_years} years` : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No teachers found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_id">User</Label>
              <Select
                id="user_id"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
              >
                <SelectItem value="">Select User</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input
              id="subjects"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              placeholder="Mathematics, Science, English"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="B.Sc, M.Sc, PhD"
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Experience (years)</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeacher ? 'Update' : 'Create'} Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Teachers
