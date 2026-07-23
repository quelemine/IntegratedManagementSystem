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

function Parents() {
  const [parents, setParents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    relationship: '',
    occupation: '',
    employer: '',
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
        const [parentsRes, usersRes] = await Promise.all([
          axios.get('/api/parents', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users?role=parent', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setParents(parentsRes.data.data)
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
    setEditingParent(null)
    setFormData({
      user_id: '',
      relationship: '',
      occupation: '',
      employer: '',
      phone: '',
      address: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (parent) => {
    setEditingParent(parent)
    setFormData({
      user_id: parent.user_id || '',
      relationship: parent.relationship || '',
      occupation: parent.occupation || '',
      employer: parent.employer || '',
      phone: parent.phone || '',
      address: parent.address || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this parent?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/parents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setParents(parents.filter(p => p.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete parent')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingParent) {
        await axios.put(`/api/parents/${editingParent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setParents(parents.map(p => p.id === editingParent.id ? { ...p, ...formData } : p))
      } else {
        await axios.post('/api/parents', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await axios.get('/api/parents', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setParents(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save parent')
    }
  }

  const filteredParents = parents.filter(parent =>
    `${parent.first_name} ${parent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl font-bold">Parents</h1>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Parent
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
              placeholder="Search by name or relationship..."
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
                <TableHead>Email</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>{parent.first_name} {parent.last_name}</TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell>{parent.relationship || 'N/A'}</TableCell>
                  <TableCell>{parent.occupation || 'N/A'}</TableCell>
                  <TableCell>{parent.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(parent)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(parent.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredParents.length === 0 && (
            <div className="text-center py-8 text-gray-500">No parents found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParent ? 'Edit Parent' : 'Add Parent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="Father, Mother, Guardian"
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="employer">Employer</Label>
            <Input
              id="employer"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
            />
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
              {editingParent ? 'Update' : 'Create'} Parent
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Parents
