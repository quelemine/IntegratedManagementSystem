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
import { Plus, Edit, Trash2, Search, Calendar, BarChart3, Users, CheckCircle, XCircle, Clock } from 'lucide-react'

function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [calendarData, setCalendarData] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [selectedChild, setSelectedChild] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    date: '',
    status: '',
    remarks: ''
  })
  const [bulkFormData, setBulkFormData] = useState({
    class_id: '',
    date: new Date().toISOString().split('T')[0],
    attendance_records: []
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    fetchData()
  }, [navigate, filterClass, filterDate, currentMonth, currentYear, selectedChild])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (user.role === 'student') {
        // Student view - show calendar
        await fetchStudentCalendar()
      } else if (user.role === 'parent') {
        // Parent view - fetch children first
        await fetchChildren()
        if (selectedChild) {
          await fetchChildCalendar(selectedChild)
        }
      } else {
        // Admin/Teacher view - show list
        await fetchAttendanceList()
      }
      
      // Fetch classes for all roles
      const classesRes = await axios.get('/classes')
      setClasses(classesRes.data.data)
      
      // Fetch students for admin/teacher
      if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal' || user.role === 'teacher') {
        const studentsRes = await axios.get('/students')
        setStudents(studentsRes.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceList = async () => {
    const attendanceRes = await axios.get('/attendance', { 
      params: { class_id: filterClass || undefined, date: filterDate || undefined }
    })
    setAttendance(attendanceRes.data.data)
  }

  const fetchStudentCalendar = async () => {
    try {
      const student = await axios.get('/students')
      const studentData = student.data.data.find(s => s.user_id === user.id)
      if (studentData) {
        const calendarRes = await axios.get(`/attendance/calendar/${studentData.id}`, {
          params: { month: currentMonth, year: currentYear }
        })
        setCalendarData(calendarRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching calendar:', err)
    }
  }

  const fetchChildren = async () => {
    try {
      const parent = await axios.get('/parents')
      const parentData = parent.data.data.find(p => p.user_id === user.id)
      if (parentData) {
        const childrenRes = await axios.get(`/students/parent/${parentData.id}`)
        setChildren(childrenRes.data.data)
        if (childrenRes.data.data.length > 0 && !selectedChild) {
          setSelectedChild(childrenRes.data.data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching children:', err)
    }
  }

  const fetchChildCalendar = async (childId) => {
    try {
      const calendarRes = await axios.get(`/attendance/calendar/${childId}`, {
        params: { month: currentMonth, year: currentYear }
      })
      setCalendarData(calendarRes.data.data)
    } catch (err) {
      console.error('Error fetching child calendar:', err)
    }
  }

  const fetchStatistics = async () => {
    try {
      const statsRes = await axios.get('/attendance/statistics', {
        params: { start_date: filterDate || undefined, class_id: filterClass || undefined }
      })
      setStatistics(statsRes.data.data)
    } catch (err) {
      console.error('Error fetching statistics:', err)
    }
  }

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

  const handleBulkCreate = () => {
    setBulkFormData({
      class_id: '',
      date: new Date().toISOString().split('T')[0],
      attendance_records: []
    })
    setIsBulkModalOpen(true)
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
        await fetchAttendanceList()
      }
      setIsModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance')
    }
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/attendance/bulk', bulkFormData)
      setIsBulkModalOpen(false)
      await fetchAttendanceList()
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance')
    }
  }

  const handleClassChangeForBulk = async (classId) => {
    setBulkFormData({ ...bulkFormData, class_id: classId, attendance_records: [] })
    if (classId) {
      try {
        const classStudents = await axios.get('/students', { params: { class_id: classId } })
        const records = classStudents.data.data.map(student => ({
          student_id: student.id,
          status: 'present',
          remarks: ''
        }))
        setBulkFormData({ ...bulkFormData, class_id: classId, attendance_records: records })
      } catch (err) {
        console.error('Error fetching class students:', err)
      }
    }
  }

  const handleBulkRecordChange = (studentId, field, value) => {
    const updatedRecords = bulkFormData.attendance_records.map(record =>
      record.student_id === studentId ? { ...record, [field]: value } : record
    )
    setBulkFormData({ ...bulkFormData, attendance_records: updatedRecords })
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

  const statusIcons = {
    present: <CheckCircle className="h-4 w-4" />,
    absent: <XCircle className="h-4 w-4" />,
    late: <Clock className="h-4 w-4" />,
    excused: <Clock className="h-4 w-4" />
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate()
  }

  const getCalendarDays = () => {
    const days = []
    const totalDays = getDaysInMonth(currentMonth, currentYear)
    const attendanceMap = new Map(calendarData.map(a => [new Date(a.date).getDate(), a]))
    
    for (let i = 1; i <= totalDays; i++) {
      const attendance = attendanceMap.get(i)
      days.push({
        day: i,
        attendance: attendance || null
      })
    }
    return days
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
              {user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal') && (
                <Button onClick={() => { setIsStatsModalOpen(true); fetchStatistics(); }} className="text-sm sm:text-base">
                  <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Statistics</span>
                </Button>
              )}
              {user && (user.role === 'super_admin' || user.role === 'principal' || user.role === 'teacher') && (
                <Button onClick={handleBulkCreate} className="text-sm sm:text-base">
                  <Users className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Bulk Mark</span>
                  <span className="sm:hidden">Bulk</span>
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

        {/* Parent View - Child Selection */}
        {user.role === 'parent' && (
          <div className="mb-4">
            <Label htmlFor="child-select">Select Child</Label>
            <Select
              id="child-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* Student/Parent View - Calendar */}
        {(user.role === 'student' || user.role === 'parent') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  if (currentMonth === 1) {
                    setCurrentMonth(12)
                    setCurrentYear(currentYear - 1)
                  } else {
                    setCurrentMonth(currentMonth - 1)
                  }
                }}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  if (currentMonth === 12) {
                    setCurrentMonth(1)
                    setCurrentYear(currentYear + 1)
                  } else {
                    setCurrentMonth(currentMonth + 1)
                  }
                }}>
                  Next
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm">
                  {day}
                </div>
              ))}
              {getCalendarDays().map(({ day, attendance }) => {
                const date = new Date(currentYear, currentMonth - 1, day)
                const firstDayOffset = date.getDay()
                
                return (
                  <div
                    key={day}
                    className={`p-2 rounded-lg text-center ${
                      attendance 
                        ? statusColors[attendance.status]
                        : 'bg-gray-50'
                    }`}
                    title={attendance?.remarks || attendance?.status}
                  >
                    <div className="text-sm font-medium">{day}</div>
                    {attendance && (
                      <div className="mt-1">
                        {statusIcons[attendance.status]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex gap-4 justify-center">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${color}`}></div>
                  <span className="text-sm capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin/Teacher View - List */}
        {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'principal' || user.role === 'teacher') && (
          <>
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
          </>
        )}
      </div>

      {/* Single Attendance Modal */}
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

      {/* Bulk Attendance Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Mark Attendance"
        size="xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bulk_class_id">Class</Label>
              <Select
                id="bulk_class_id"
                value={bulkFormData.class_id}
                onChange={(e) => handleClassChangeForBulk(e.target.value)}
                required
              >
                <SelectItem value="">Select Class</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="bulk_date">Date</Label>
              <Input
                id="bulk_date"
                type="date"
                value={bulkFormData.date}
                onChange={(e) => setBulkFormData({ ...bulkFormData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {bulkFormData.attendance_records.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkFormData.attendance_records.map((record) => {
                    const student = students.find(s => s.id === record.student_id)
                    return (
                      <TableRow key={record.student_id}>
                        <TableCell>{student?.first_name} {student?.last_name}</TableCell>
                        <TableCell>
                          <Select
                            value={record.status}
                            onChange={(e) => handleBulkRecordChange(record.student_id, 'status', e.target.value)}
                          >
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={record.remarks}
                            onChange={(e) => handleBulkRecordChange(record.student_id, 'remarks', e.target.value)}
                            placeholder="Remarks"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={bulkFormData.attendance_records.length === 0}>
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Statistics Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="Attendance Statistics"
        size="lg"
      >
        {statistics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{statistics.overall?.present || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overall?.absent || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.overall?.late || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Excused</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.overall?.excused || 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Monthly Statistics (Last 6 Months)</h3>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.monthly?.map((stat) => (
                      <TableRow key={stat.month}>
                        <TableCell>{stat.month}</TableCell>
                        <TableCell>{stat.present}</TableCell>
                        <TableCell>{stat.absent}</TableCell>
                        <TableCell>{stat.late}</TableCell>
                        <TableCell>{stat.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading statistics...</div>
        )}
      </Modal>
    </div>
  )
}

export default Attendance
