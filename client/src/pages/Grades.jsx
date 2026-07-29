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
import { Plus, Edit, Trash2, Search, Download, Printer, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

function Grades() {
  const [grades, setGrades] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [selectedGrades, setSelectedGrades] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
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
          axios.get('/grades'),
          axios.get('/divisions')
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

    try {
      await axios.delete(`/grades/${id}`)
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
        await axios.put(`/grades/${editingGrade.id}`, formData)
        setGrades(grades.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g))
      } else {
        await axios.post('/grades', formData)
        const response = await axios.get('/grades')
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

  // Sort grades
  const sortedGrades = [...filteredGrades].sort((a, b) => {
    let aVal = a[sortColumn]
    let bVal = b[sortColumn]
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedGrades.length / itemsPerPage)
  const paginatedGrades = sortedGrades.slice(
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
      setSelectedGrades(paginatedGrades.map(g => g.id))
    } else {
      setSelectedGrades([])
    }
  }

  const handleSelectGrade = (id) => {
    setSelectedGrades(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Code', 'Division', 'Order']
    const rows = sortedGrades.map(g => [
      g.name,
      g.code,
      g.division_name || 'N/A',
      g.order || 'N/A'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grades_export.csv'
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
              <h1 className="text-lg sm:text-xl font-bold">Grades</h1>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" className="text-sm sm:text-base">
                  <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button onClick={handleCreate} className="text-sm sm:text-base">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Grade</span>
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
              placeholder="Search by name, code, or division..."
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
                checked={paginatedGrades.length > 0 && selectedGrades.length === paginatedGrades.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedGrades.length} selected
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
                    checked={paginatedGrades.length > 0 && selectedGrades.length === paginatedGrades.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
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
                <TableHead>
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Code
                    {sortColumn === 'code' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Division</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('order')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Order
                    {sortColumn === 'order' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGrades.map((grade) => (
                <TableRow key={grade.id} className={selectedGrades.includes(grade.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes(grade.id)}
                      onChange={() => handleSelectGrade(grade.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{grade.name}</TableCell>
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
          {paginatedGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">No grades found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedGrades.length)} of {sortedGrades.length} grades
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
