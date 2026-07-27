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

function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    date: '',
    status: '',
    remarks: ''
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
        const [attendanceRes, studentsRes, classesRes] = await Promise.all([
          axios.get('/attendance', { 
            params: { class_id: filterClass || undefined, date: filterDate || undefined }
          }),
          axios.get('/students'),
          axios.get('/classes')
        ])
        setAttendance(attendanceRes.data.data)
        setStudents(studentsRes.data.data)
        setClasses(classesRes.data.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, filterClass, filterDate])

  const handleCreate = () => {
    setEditingAttendance(null)
    setFormData({
      student_id: '',
      class_id: '',
      date: new Date().toISOString().split('T')[0],
      status: '',
      remarks: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (att) => {
    setEditingAttendance(att)
    setFormData({
      student_id: att.student_id,
      class_id: att.class_id,
      date: att.date,
      status: att.status,
      remarks: att.remarks || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      await axios.delete(`/attendance/${id}`)
      setAttendance(attendance.filter(a => a.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete attendance')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingAttendance) {
        await axios.put(`/attendance/${editingAttendance.id}`, formData)
        setAttendance(attendance.map(a => a.id === editingAttendance.id ? { ...a, ...formData } : a))
      } else {
        await axios.post('/attendance', formData)
        const response = await axios.get('/attendance', {
          params: { class_id: filterClass || undefined, date: filterDate || undefined }
        })
        setAttendance(response.data.data)
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance')
    }
  }

  const filteredAttendance = attendance.filter(att =>
    att.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${att.first_name} ${att.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800'
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
              <h1 className="text-lg sm:text-xl font-bold">Attendance</h1>
              {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                <Button onClick={handleCreate} className="text-sm sm:text-base">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mark Attendance</span>
                  <span className="sm:hidden">Mark</span>
                </Button>
              )}
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

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <Select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <SelectItem value="">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter by date"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((att) => (
                <TableRow key={att.id}>
                  <TableCell>{att.date}</TableCell>
                  <TableCell>{att.student_number || 'N/A'}</TableCell>
                  <TableCell>{att.first_name} {att.last_name}</TableCell>
                  <TableCell>{att.class_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusColors[att.status] || 'bg-gray-100 text-gray-800'}`}>
                      {att.status}
                    </span>
                  </TableCell>
                  <TableCell>{att.remarks || '-'}</TableCell>
                  <TableCell>
                    {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(att)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(att.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">No attendance records found</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem key={student.id} value={student.id}>{student.first_name} {student.last_name} ({student.student_id})</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="class_id">Class</Label>
            <Select
              id="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              required
            >
              <SelectItem value="">Select Class</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <SelectItem value="">Select Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
            </Select>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Optional remarks"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAttendance ? 'Update' : 'Mark'} Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Attendance
