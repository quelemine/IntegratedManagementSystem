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

function Grades() {
  const [grades, setGrades] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [formData, setFormData] = useState({
    division_id: '',
    name: '',
    code: '',
    order: ''
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
        const [gradesRes, divisionsRes] = await Promise.all([
          axios.get('/api/grades', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/divisions', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setGrades(gradesRes.data.data)
        setDivisions(divisionsRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleCreate = () => {
    setEditingGrade(null)
    setFormData({
      division_id: '',
      name: '',
      code: '',
      order: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setFormData({
      division_id: grade.division_id || '',
      name: grade.name || '',
      code: grade.code || '',
      order: grade.order || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this grade?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/grades/${id}`, {
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
        await axios.put(`/api/grades/${editingGrade.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setGrades(grades.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g))
      } else {
        await axios.post('/api/grades', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/grades', {
          headers: { Authorization: `Bearer ${token}` }
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
    grade.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.division_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl font-bold">Grades</h1>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
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
              placeholder="Search by name, code, or division..."
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
                <TableHead>Code</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.name}</TableCell>
                  <TableCell>{grade.code}</TableCell>
                  <TableCell>{grade.division_name || 'N/A'}</TableCell>
                  <TableCell>{grade.order || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(grade)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(grade.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
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
            <Label htmlFor="division_id">Division</Label>
            <Select
              id="division_id"
              value={formData.division_id}
              onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Division</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Grade Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Grade 1, Grade 2"
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., G1, G2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              placeholder="e.g., 1, 2, 3"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingGrade ? 'Update' : 'Create'} Grade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Grades
