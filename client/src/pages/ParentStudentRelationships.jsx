import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Plus, Edit, Trash2, Search, User, Users } from 'lucide-react'

function ParentStudentRelationships() {
  const [relationships, setRelationships] = useState([])
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState(null)
  const [formData, setFormData] = useState({
    parent_id: '',
    student_id: '',
    relationship_type: 'guardian',
    is_primary: false
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
        const [relationshipsRes, parentsRes, studentsRes] = await Promise.all([
          axios.get('/parent-student-relationships'),
          axios.get('/parents'),
          axios.get('/students')
        ])
        setRelationships(relationshipsRes.data.data)
        setParents(parentsRes.data.data)
        setStudents(studentsRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleCreate = () => {
    setEditingRelationship(null)
    setFormData({
      parent_id: '',
      student_id: '',
      relationship_type: 'guardian',
      is_primary: false
    })
    setIsModalOpen(true)
  }

  const handleEdit = (relationship) => {
    setEditingRelationship(relationship)
    setFormData({
      parent_id: relationship.parent_id,
      student_id: relationship.student_id,
      relationship_type: relationship.relationship_type,
      is_primary: relationship.is_primary
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return

    try {
      await axios.delete(`/parent-student-relationships/${id}`)
      setRelationships(relationships.filter(r => r.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete relationship')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingRelationship) {
        await axios.put(`/parent-student-relationships/${editingRelationship.id}`, formData)
        setRelationships(relationships.map(r => r.id === editingRelationship.id ? { ...r, ...formData } : r))
      } else {
        await axios.post('/parent-student-relationships', formData)
        const response = await axios.get('/parent-student-relationships')
        setRelationships(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save relationship')
    }
  }

  const filteredRelationships = relationships.filter(rel =>
    `${rel.parent_first_name} ${rel.parent_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${rel.student_first_name} ${rel.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rel.student_student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Parent-Student Relationships</h1>
              <Button onClick={handleCreate} className="text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Relationship</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
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
              placeholder="Search by parent name, student name, or student ID..."
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
                <TableHead>Parent</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRelationships.map((rel) => (
                <TableRow key={rel.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {rel.parent_first_name} {rel.parent_last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {rel.student_first_name} {rel.student_last_name}
                    </div>
                  </TableCell>
                  <TableCell>{rel.student_student_id || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{rel.relationship_type}</TableCell>
                  <TableCell>{rel.is_primary ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rel.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRelationships.length === 0 && (
            <div className="text-center py-8 text-gray-500">No relationships found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRelationship ? 'Edit Relationship' : 'Add Relationship'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="parent_id">Parent</Label>
            <Select
              id="parent_id"
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Parent</SelectItem>
              {parents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.first_name} {parent.last_name} ({parent.email})
                </SelectItem>
              ))}
            </Select>
          </div>

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
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.student_id || 'No ID'})
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="relationship_type">Relationship Type</Label>
            <Select
              id="relationship_type"
              value={formData.relationship_type}
              onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })}
              required
            >
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="guardian">Guardian</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="is_primary" className="mb-0">Primary Contact</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRelationship ? 'Update' : 'Create'} Relationship
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ParentStudentRelationships
