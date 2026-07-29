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
import { Plus, Edit, Trash2, Search, Upload, Download, Printer, ChevronLeft, ChevronRight, ArrowUpDown, Check } from 'lucide-react'

function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [grades, setGrades] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState('student_id')
  const [sortDirection, setSortDirection] = useState('asc')
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    grade_id: '',
    division_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_info: ''
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
        const [studentsRes, classesRes, gradesRes, divisionsRes] = await Promise.all([
          axios.get('/students'),
          axios.get('/classes'),
          axios.get('/grades'),
          axios.get('/divisions')
        ])
        setStudents(studentsRes.data.data)
        setClasses(classesRes.data.data)
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
    setEditingStudent(null)
    setFormData({
      student_id: '',
      class_id: '',
      grade_id: '',
      division_id: '',
      date_of_birth: '',
      gender: '',
      address: '',
      phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_info: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      student_id: student.student_id,
      class_id: student.class_id || '',
      grade_id: student.grade_id || '',
      division_id: student.division_id || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      address: student.address || '',
      phone: student.phone || '',
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_phone: student.emergency_contact_phone || '',
      medical_info: student.medical_info || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      await axios.delete(`/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete student')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingStudent) {
        await axios.put(`/students/${editingStudent.id}`, formData)
        setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s))
      } else {
        await axios.post('/students', formData)
        const response = await axios.get('/students')
        setStudents(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save student')
    }
  }

  const downloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'email', 'phone', 'student_id', 'class_id', 'grade_id', 'division_id', 'date_of_birth', 'gender', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'medical_info'];
    const csvContent = headers.join(',') + '\nJohn,Doe,john.doe@example.com,+1234567890,STU001,,,1,2000-01-15,male,123 Main St,Jane Doe,+1234567891,No allergies';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
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
      
      const students = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const student = {}
        headers.forEach((header, index) => {
          student[header] = values[index] || ''
        })
        students.push(student)
        
        // Update progress
        const progress = Math.round((i / (lines.length - 1)) * 100)
        setImportProgress(progress)
      }

      console.log('[IMPORT] Sending students:', students)
      const response = await axios.post('/students/bulk-import', { students })
      console.log('[IMPORT] Response:', response.data)
      
      setImportResults(response.data.data)
      
      // Refresh students list
      const studentsRes = await axios.get('/students')
      setStudents(studentsRes.data.data)
      
      setIsImportModalOpen(false)
      setImportFile(null)
      setImportProgress(0)
    } catch (err) {
      console.error('[IMPORT] Error:', err)
      setError(err.response?.data?.error || 'Failed to import students')
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const filteredStudents = students.filter(student =>
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortColumn]
    let bVal = b[sortColumn]
    
    if (sortColumn === 'name') {
      aVal = `${a.first_name} ${a.last_name}`
      bVal = `${b.first_name} ${b.last_name}`
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage)
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Class', 'Grade', 'Division', 'Status']
    const rows = sortedStudents.map(s => [
      s.student_id,
      `${s.first_name} ${s.last_name}`,
      s.email || '',
      s.phone || '',
      s.class_name || 'N/A',
      s.grade_name || 'N/A',
      s.division_name || 'N/A',
      s.status || 'active'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

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
              <h1 className="text-lg sm:text-xl font-bold">Students</h1>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" className="text-sm sm:text-base">
                  <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
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
                  <span className="hidden sm:inline">Add Student</span>
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
              placeholder="Search by student ID, name, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={paginatedStudents.length > 0 && selectedStudents.length === paginatedStudents.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={paginatedStudents.length > 0 && selectedStudents.length === paginatedStudents.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('student_id')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Student ID
                    {sortColumn === 'student_id' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Name
                    {sortColumn === 'name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('class_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Class
                    {sortColumn === 'class_name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('grade_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Grade
                    {sortColumn === 'grade_name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id} className={selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{student.email || 'N/A'}</TableCell>
                  <TableCell>{student.class_name || 'N/A'}</TableCell>
                  <TableCell>{student.grade_name || 'N/A'}</TableCell>
                  <TableCell>{student.division_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status || 'active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">No students found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedStudents.length)} of {sortedStudents.length} students
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <SelectItem value="">Select Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="division_id">Division</Label>
              <Select
                id="division_id"
                value={formData.division_id}
                onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
              >
                <SelectItem value="">Select Division</SelectItem>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>{div.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="grade_id">Grade</Label>
              <Select
                id="grade_id"
                value={formData.grade_id}
                onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
              >
                <SelectItem value="">Select Grade</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="class_id">Class</Label>
            <Select
              id="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            >
              <SelectItem value="">Select Class</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medical_info">Medical Information</Label>
            <Input
              id="medical_info"
              value={formData.medical_info}
              onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStudent ? 'Update' : 'Create'} Student
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Students from CSV"
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
              CSV should have headers: first_name, last_name, email, phone, student_id, class_id, grade_id, division_id, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, medical_info
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

export default Students
