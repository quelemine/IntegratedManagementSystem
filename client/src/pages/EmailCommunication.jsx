import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectItem } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Mail, Send, Save, Eye, Users, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react'

function EmailCommunication() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [grades, setGrades] = useState([])
  const [classes, setClasses] = useState([])
  const [divisions, setDivisions] = useState([])
  const [recipients, setRecipients] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [filterGrade, setFilterGrade] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDivision, setFilterDivision] = useState('')
  const [filterAcademicYear, setFilterAcademicYear] = useState('')
  
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    isHtml: false
  })
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'principal')) {
      navigate('/dashboard')
      return
    }
    fetchInitialData()
  }, [user, navigate])

  const fetchInitialData = async () => {
    try {
      const [gradesRes, classesRes, divisionsRes, statsRes] = await Promise.all([
        axios.get('/grades'),
        axios.get('/classes'),
        axios.get('/divisions'),
        axios.get('/email-communication/stats')
      ])
      
      setGrades(gradesRes.data)
      setClasses(classesRes.data)
      setDivisions(divisionsRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load initial data')
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterGrade) params.append('grade_id', filterGrade)
      if (filterClass) params.append('class_id', filterClass)
      if (filterDivision) params.append('division_id', filterDivision)
      if (filterAcademicYear) params.append('academic_year', filterAcademicYear)
      
      const res = await axios.get(`/email-communication/recipients?${params}`)
      setRecipients(res.data)
      setSelectedRecipients(res.data.map(r => r.id))
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch recipients')
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    fetchRecipients()
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRecipients(recipients.map(r => r.id))
    } else {
      setSelectedRecipients([])
    }
  }

  const handleSelectRecipient = (id) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    )
  }

  const handlePreview = () => {
    const selectedRecipientsData = recipients.filter(r => selectedRecipients.includes(r.id))
    if (selectedRecipientsData.length === 0) {
      setError('Please select at least one recipient')
      return
    }
    if (!emailForm.subject || !emailForm.message) {
      setError('Please enter subject and message')
      return
    }
    setPreviewData({
      recipients: selectedRecipientsData,
      subject: emailForm.subject,
      message: emailForm.message
    })
    setIsPreviewOpen(true)
  }

  const handleSendEmail = async () => {
    const selectedRecipientsData = recipients.filter(r => selectedRecipients.includes(r.id))
    if (selectedRecipientsData.length === 0) {
      setError('Please select at least one recipient')
      return
    }
    if (!emailForm.subject || !emailForm.message) {
      setError('Please enter subject and message')
      return
    }

    try {
      setSending(true)
      setError('')
      setSuccess('')
      
      const res = await axios.post('/email-communication/send', {
        recipients: selectedRecipientsData,
        subject: emailForm.subject,
        message: emailForm.message,
        isHtml: emailForm.isHtml
      })
      
      setSuccess(res.data.message)
      setEmailForm({ subject: '', message: '', isHtml: false })
      setSelectedRecipients([])
      setIsPreviewOpen(false)
      setSending(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email')
      setSending(false)
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('emailDraft', JSON.stringify(emailForm))
    setSuccess('Draft saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  useEffect(() => {
    const savedDraft = localStorage.getItem('emailDraft')
    if (savedDraft) {
      setEmailForm(JSON.parse(savedDraft))
    }
  }, [])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Email Communication</h1>
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
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Students with Email</p>
                  <p className="text-2xl font-bold">{stats.total_students}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Grades</p>
                  <p className="text-2xl font-bold">{stats.by_grade?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Classes</p>
                  <p className="text-2xl font-bold">{stats.by_class?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipients Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipients
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Grade</Label>
                <Select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  <SelectItem value="">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Class</Label>
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
                <Label>Division</Label>
                <Select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                >
                  <SelectItem value="">All Divisions</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>{div.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input
                  type="text"
                  value={filterAcademicYear}
                  onChange={(e) => setFilterAcademicYear(e.target.value)}
                  placeholder="e.g., 2024-2025"
                />
              </div>
            </div>
            
            <Button onClick={handleFilterChange} className="w-full mb-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter Recipients
            </Button>

            <div className="border rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <span className="text-sm font-medium">
                  {selectedRecipients.length} of {recipients.length} selected
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={recipients.length > 0 && selectedRecipients.length === recipients.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  Select All
                </label>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Select</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.map((recipient) => (
                      <TableRow key={recipient.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(recipient.id)}
                            onChange={() => handleSelectRecipient(recipient.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>{recipient.name}</TableCell>
                        <TableCell className="text-sm">{recipient.email}</TableCell>
                        <TableCell>{recipient.grade_name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {recipients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recipients found. Apply filters to load students.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Composition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Email
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>From</Label>
                <Input
                  value={`${process.env.VITE_SMTP_FROM || 'noreply@simtechinstitute.edu'}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label>To</Label>
                <Input
                  value={`${selectedRecipients.length} recipient(s)`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label>Subject *</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <Label>Message *</Label>
                <Textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={10}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isHtml"
                  checked={emailForm.isHtml}
                  onChange={(e) => setEmailForm({ ...emailForm, isHtml: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isHtml" className="text-sm">Use HTML formatting</Label>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex-1"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {sending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Email Preview"
      >
        {previewData && (
          <div className="space-y-4">
            <div>
              <Label>Recipients ({previewData.recipients.length})</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded max-h-32 overflow-y-auto text-sm">
                {previewData.recipients.map(r => (
                  <div key={r.id}>{r.name} ({r.email})</div>
                ))}
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded font-medium">
                {previewData.subject}
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {previewData.message}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsPreviewOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EmailCommunication
