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
import { Plus, Edit, Trash2, Search, Upload, Download, Printer, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

function Parents() {
  const [parents, setParents] = useState([])
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
  const [editingParent, setEditingParent] = useState(null)
  const [selectedParents, setSelectedParents] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
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
          axios.get('/parents'),
          axios.get('/users?role=parent')
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

    try {
      await axios.delete(`/parents/${id}`)
      setParents(parents.filter(p => p.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete parent')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingParent) {
        await axios.put(`/parents/${editingParent.id}`, formData)
        setParents(parents.map(p => p.id === editingParent.id ? { ...p, ...formData } : p))
      } else {
        await axios.post('/parents', formData)
        const response = await axios.get('/parents')
        setParents(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save parent')
    }
  }

  const downloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'email', 'phone', 'relationship', 'occupation', 'employer', 'address'];
    const csvContent = headers.join(',') + '\nRobert,Johnson,robert.johnson@example.com,+1234567893,Father,Engineer,Tech Corp,789 Pine St';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parents_template.csv';
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
      
      const parents = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const parent = {}
        headers.forEach((header, index) => {
          parent[header] = values[index] || ''
        })
        parents.push(parent)
        
        // Update progress
        const progress = Math.round((i / (lines.length - 1)) * 100)
        setImportProgress(progress)
      }

      console.log('[IMPORT] Sending parents:', parents)
      const response = await axios.post('/parents/bulk-import', { parents })
      console.log('[IMPORT] Response:', response.data)
      
      setImportResults(response.data.data)
      
      // Refresh parents list
      const parentsRes = await axios.get('/parents')
      setParents(parentsRes.data.data)
      
      setIsImportModalOpen(false)
      setImportFile(null)
      setImportProgress(0)
    } catch (err) {
      console.error('[IMPORT] Error:', err)
      setError(err.response?.data?.error || 'Failed to import parents')
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const filteredParents = parents.filter(parent =>
    `${parent.first_name} ${parent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.relationship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort parents
  const sortedParents = [...filteredParents].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedParents.length / itemsPerPage)
  const paginatedParents = sortedParents.slice(
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
      setSelectedParents(paginatedParents.map(p => p.id))
    } else {
      setSelectedParents([])
    }
  }

  const handleSelectParent = (id) => {
    setSelectedParents(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Relationship', 'Occupation', 'Employer', 'Address', 'Status']
    const rows = sortedParents.map(p => [
      `${p.first_name} ${p.last_name}`,
      p.email || 'N/A',
      p.phone || 'N/A',
      p.relationship || 'N/A',
      p.occupation || 'N/A',
      p.employer || 'N/A',
      p.address || 'N/A',
      p.status || 'active'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parents_export.csv'
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
              <h1 className="text-lg sm:text-xl font-bold">Parents</h1>
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
                  <span className="hidden sm:inline">Add Parent</span>
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
              placeholder="Search by name, email, or relationship..."
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
                checked={paginatedParents.length > 0 && selectedParents.length === paginatedParents.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedParents.length} selected
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
                    checked={paginatedParents.length > 0 && selectedParents.length === paginatedParents.length}
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('relationship')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Relationship
                    {sortColumn === 'relationship' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('occupation')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Occupation
                    {sortColumn === 'occupation' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Employer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedParents.map((parent) => (
                <TableRow key={parent.id} className={selectedParents.includes(parent.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedParents.includes(parent.id)}
                      onChange={() => handleSelectParent(parent.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{parent.first_name} {parent.last_name}</TableCell>
                  <TableCell>{parent.email || 'N/A'}</TableCell>
                  <TableCell>{parent.phone || 'N/A'}</TableCell>
                  <TableCell>{parent.relationship || 'N/A'}</TableCell>
                  <TableCell>{parent.occupation || 'N/A'}</TableCell>
                  <TableCell>{parent.employer || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      parent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {parent.status || 'active'}
                    </span>
                  </TableCell>
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
          {paginatedParents.length === 0 && (
            <div className="text-center py-8 text-gray-500">No parents found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedParents.length)} of {sortedParents.length} parents
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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Parents from CSV"
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
              CSV should have headers: first_name, last_name, email, phone, relationship, occupation, employer, address
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

export default Parents
