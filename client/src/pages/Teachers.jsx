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
import { Plus, Edit, Trash2, Search, Upload } from 'lucide-react'

function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState(null)
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
          axios.get('/teachers'),
          axios.get('/users?role=teacher')
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

    try {
      await axios.delete(`/teachers/${id}`)
      setTeachers(teachers.filter(t => t.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete teacher')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingTeacher) {
        await axios.put(`/teachers/${editingTeacher.id}`, formData)
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t))
      } else {
        await axios.post('/teachers', formData)
        const response = await axios.get('/teachers')
        setTeachers(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save teacher')
    }
  }

  const downloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'email', 'phone', 'employee_id', 'subject_specialization', 'qualification', 'experience_years', 'joining_date', 'address', 'emergency_contact_name', 'emergency_contact_phone'];
    const csvContent = headers.join(',') + '\nJane,Smith,jane.smith@example.com,+1234567890,EMP001,Mathematics,B.Sc,5,2020-09-01,456 Oak St,John Smith,+1234567892';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a CSV file')
      return
    }

    // Validate file type
    if (importFile.type !== 'text/csv' && !importFile.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (importFile.size > maxSize) {
      setError('File size exceeds 5MB limit')
      return
    }

    setImporting(true)
    setError('')
    setImportResults(null)

    try {
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const teachers = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const teacher = {}
        headers.forEach((header, index) => {
          teacher[header] = values[index] || ''
        })
        teachers.push(teacher)
        
        // Update progress
        const progress = Math.round((i / (lines.length - 1)) * 100)
        setImportProgress(progress)
      }

      console.log('[IMPORT] Sending teachers:', teachers)
      const response = await axios.post('/teachers/bulk-import', { teachers })
      console.log('[IMPORT] Response:', response.data)
      
      setImportResults(response.data.data)
      
      // Refresh teachers list
      const teachersRes = await axios.get('/teachers')
      setTeachers(teachersRes.data.data)
      
      setIsImportModalOpen(false)
      setImportFile(null)
      setImportProgress(0)
    } catch (err) {
      console.error('[IMPORT] Error:', err)
      setError(err.response?.data?.error || 'Failed to import teachers')
    } finally {
      setImporting(false)
      setImportProgress(0)
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
              <h1 className="text-lg sm:text-xl font-bold">Teachers</h1>
              <div className="flex gap-2">
                <Button onClick={downloadTemplate} variant="outline" className="text-sm sm:text-base">
                  Download Template
                </Button>
                <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="text-sm sm:text-base">
                  <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Import</span>
                  <span className="sm:hidden">Import</span>
                </Button>
                <Button onClick={handleCreate} className="text-sm sm:text-base">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Teacher</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Teachers from CSV"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV should have headers: first_name, last_name, email, phone, employee_id, subject_specialization, qualification, experience_years, joining_date, address, emergency_contact_name, emergency_contact_phone
            </p>
          </div>

          {importing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Processing...</span>
                <span className="text-sm text-blue-700">{importProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {importResults && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Import Results:</p>
              <p className="text-green-600">Success: {importResults.success}</p>
              <p className="text-red-600">Failed: {importResults.failed}</p>
              {importResults.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600">View errors</summary>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {importResults.errors.map((err, idx) => (
                      <div key={idx} className="text-xs text-red-600 mb-1">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Teachers
