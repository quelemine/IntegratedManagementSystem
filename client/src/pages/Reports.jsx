import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { FileText, Download, Printer, BarChart3, Users, DollarSign, Calendar, GraduationCap, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchDropdownData();
  }, [user, navigate]);

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, classesRes, gradesRes] = await Promise.all([
        axios.get('/students'),
        axios.get('/classes'),
        axios.get('/grades')
      ]);
      setStudents(studentsRes.data.data);
      setClasses(classesRes.data.data);
      setGrades(gradesRes.data.data);

      // Auto-select student if user is a student
      if (user.role === 'student') {
        const studentData = studentsRes.data.data.find(s => s.user_id === user.id);
        if (studentData) {
          setSelectedStudent(studentData.id);
        }
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const generateReport = async () => {
    if (!selectedReport) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    setError('');
    setReportData(null);

    try {
      let response;
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      switch (selectedReport) {
        case 'academic':
          if (!selectedStudent) {
            setError('Please select a student');
            setLoading(false);
            return;
          }
          response = await axios.get(`/reports/student/${selectedStudent}/academic`);
          break;
        case 'attendance':
          if (!selectedStudent) {
            setError('Please select a student');
            setLoading(false);
            return;
          }
          response = await axios.get(`/reports/student/${selectedStudent}/attendance`, { params });
          break;
        case 'fees':
          if (!selectedStudent) {
            setError('Please select a student');
            setLoading(false);
            return;
          }
          response = await axios.get(`/reports/student/${selectedStudent}/fees`);
          break;
        case 'class_performance':
          if (!selectedClass) {
            setError('Please select a class');
            setLoading(false);
            return;
          }
          response = await axios.get(`/reports/class/${selectedClass}/performance`);
          break;
        case 'enrollment':
          if (selectedGrade) params.grade_id = selectedGrade;
          response = await axios.get('/reports/enrollment', { params });
          break;
        case 'financial':
          response = await axios.get('/reports/financial', { params });
          break;
        case 'attendance_report':
          if (selectedClass) params.class_id = selectedClass;
          response = await axios.get('/reports/attendance', { params });
          break;
        default:
          setError('Invalid report type');
          setLoading(false);
          return;
      }

      setReportData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const reportTitle = getReportTitle();
    
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    let yPos = 40;

    // Add report-specific content
    switch (selectedReport) {
      case 'academic':
        doc.text(`Student: ${reportData.student.first_name} ${reportData.student.last_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Class: ${reportData.student.class_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Grade: ${reportData.student.grade_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Average Grade: ${reportData.averageGrade}%`, 14, yPos);
        yPos += 15;

        const academicData = reportData.grades.map(g => [g.subject, `${g.grade}%`]);
        doc.autoTable({
          startY: yPos,
          head: [['Subject', 'Grade']],
          body: academicData,
        });
        break;

      case 'attendance':
        doc.text(`Student: ${reportData.student.first_name} ${reportData.student.last_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Class: ${reportData.student.class_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Attendance Rate: ${reportData.statistics.attendanceRate}%`, 14, yPos);
        yPos += 10;
        doc.text(`Present: ${reportData.statistics.present}`, 14, yPos);
        yPos += 7;
        doc.text(`Absent: ${reportData.statistics.absent}`, 14, yPos);
        yPos += 7;
        doc.text(`Late: ${reportData.statistics.late}`, 14, yPos);
        yPos += 7;
        doc.text(`Excused: ${reportData.statistics.excused}`, 14, yPos);
        yPos += 15;

        const attendanceData = reportData.attendance.map(a => [a.date, a.status, a.remarks || '-']);
        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Status', 'Remarks']],
          body: attendanceData,
        });
        break;

      case 'fees':
        doc.text(`Student: ${reportData.student.first_name} ${reportData.student.last_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Class: ${reportData.student.class_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Total Billed: $${reportData.summary.totalBilled.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Paid: $${reportData.summary.totalPaid.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Outstanding Balance: $${reportData.summary.outstandingBalance.toFixed(2)}`, 14, yPos);
        yPos += 15;

        const invoiceData = reportData.invoices.map(i => [i.due_date, i.description, `$${i.amount}`, i.status]);
        doc.autoTable({
          startY: yPos,
          head: [['Due Date', 'Description', 'Amount', 'Status']],
          body: invoiceData,
        });
        break;

      case 'class_performance':
        doc.text(`Class: ${reportData.class.name}`, 14, yPos);
        yPos += 10;
        doc.text(`Grade: ${reportData.class.grade_name}`, 14, yPos);
        yPos += 10;
        doc.text(`Class Average: ${reportData.classAverage}%`, 14, yPos);
        yPos += 10;
        doc.text(`Total Students: ${reportData.totalStudents}`, 14, yPos);
        yPos += 15;

        const classData = reportData.studentStats.map(s => [`${s.first_name} ${s.last_name}`, `${s.averageGrade}%`]);
        doc.autoTable({
          startY: yPos,
          head: [['Student', 'Average Grade']],
          body: classData,
        });
        break;

      case 'enrollment':
        doc.text(`Total Students: ${reportData.statistics.totalStudents}`, 14, yPos);
        yPos += 15;

        const enrollmentData = reportData.students.map(s => [
          `${s.first_name} ${s.last_name}`,
          s.student_id,
          s.class_name,
          s.grade_name,
          s.enrollment_date
        ]);
        doc.autoTable({
          startY: yPos,
          head: [['Name', 'Student ID', 'Class', 'Grade', 'Enrollment Date']],
          body: enrollmentData,
        });
        break;

      case 'financial':
        doc.text(`Total Revenue: $${reportData.summary.totalRevenue.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Billed: $${reportData.summary.totalBilled.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Outstanding Balance: $${reportData.summary.outstandingBalance.toFixed(2)}`, 14, yPos);
        yPos += 15;

        const financialData = reportData.payments.map(p => [
          p.payment_date,
          `${p.first_name} ${p.last_name}`,
          `$${p.amount}`,
          p.method
        ]);
        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Student', 'Amount', 'Method']],
          body: financialData,
        });
        break;

      case 'attendance_report':
        doc.text(`Attendance Rate: ${reportData.statistics.attendanceRate}%`, 14, yPos);
        yPos += 7;
        doc.text(`Present: ${reportData.statistics.present}`, 14, yPos);
        yPos += 7;
        doc.text(`Absent: ${reportData.statistics.absent}`, 14, yPos);
        yPos += 7;
        doc.text(`Late: ${reportData.statistics.late}`, 14, yPos);
        yPos += 7;
        doc.text(`Excused: ${reportData.statistics.excused}`, 14, yPos);
        yPos += 15;

        const reportAttendanceData = reportData.attendance.map(a => [
          a.date,
          `${a.first_name} ${a.last_name}`,
          a.class_name,
          a.status,
          a.remarks || '-'
        ]);
        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Student', 'Class', 'Status', 'Remarks']],
          body: reportAttendanceData,
        });
        break;
    }

    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const printReport = () => {
    if (!reportData) return;
    window.print();
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'academic': return 'Academic Report Card';
      case 'attendance': return 'Attendance Report';
      case 'fees': return 'Fee Statement';
      case 'class_performance': return 'Class Performance Report';
      case 'enrollment': return 'Student Enrollment Report';
      case 'financial': return 'Financial Report';
      case 'attendance_report': return 'Attendance Summary Report';
      default: return 'Report';
    }
  };

  const getAvailableReports = () => {
    switch (user.role) {
      case 'student':
        return [
          { value: 'academic', label: 'Academic Report Card', icon: <GraduationCap className="h-4 w-4" /> },
          { value: 'attendance', label: 'Attendance Report', icon: <Calendar className="h-4 w-4" /> },
          { value: 'fees', label: 'Fee Statement', icon: <DollarSign className="h-4 w-4" /> }
        ];
      case 'teacher':
        return [
          { value: 'class_performance', label: 'Class Performance Report', icon: <BarChart3 className="h-4 w-4" /> }
        ];
      case 'super_admin':
      case 'admin':
      case 'principal':
        return [
          { value: 'enrollment', label: 'Student Enrollment Report', icon: <Users className="h-4 w-4" /> },
          { value: 'financial', label: 'Financial Report', icon: <DollarSign className="h-4 w-4" /> },
          { value: 'attendance_report', label: 'Attendance Report', icon: <Calendar className="h-4 w-4" /> },
          { value: 'academic', label: 'Academic Report Card', icon: <GraduationCap className="h-4 w-4" /> },
          { value: 'class_performance', label: 'Class Performance Report', icon: <BarChart3 className="h-4 w-4" /> }
        ];
      default:
        return [];
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'academic':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <p><strong>Name:</strong> {reportData.student.first_name} {reportData.student.last_name}</p>
              <p><strong>Class:</strong> {reportData.student.class_name}</p>
              <p><strong>Grade:</strong> {reportData.student.grade_name}</p>
              <p><strong>Average Grade:</strong> {reportData.averageGrade}%</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Grades by Subject</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject}</TableCell>
                      <TableCell>{grade.grade}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <p><strong>Name:</strong> {reportData.student.first_name} {reportData.student.last_name}</p>
              <p><strong>Class:</strong> {reportData.student.class_name}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">{reportData.statistics.attendanceRate}%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.statistics.present}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{reportData.statistics.absent}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.statistics.late}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Attendance Records</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.attendance.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell>{att.date}</TableCell>
                      <TableCell className="capitalize">{att.status}</TableCell>
                      <TableCell>{att.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <p><strong>Name:</strong> {reportData.student.first_name} {reportData.student.last_name}</p>
              <p><strong>Class:</strong> {reportData.student.class_name}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold text-blue-600">${reportData.summary.totalBilled.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${reportData.summary.totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">${reportData.summary.outstandingBalance.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoices</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.invoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell>{invoice.due_date}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>${invoice.amount}</TableCell>
                      <TableCell className="capitalize">{invoice.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'class_performance':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Class Information</h3>
              <p><strong>Class:</strong> {reportData.class.name}</p>
              <p><strong>Grade:</strong> {reportData.class.grade_name}</p>
              <p><strong>Class Average:</strong> {reportData.classAverage}%</p>
              <p><strong>Total Students:</strong> {reportData.totalStudents}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Student Performance</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Average Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.studentStats.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{student.averageGrade}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'enrollment':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Enrollment Statistics</h3>
              <p><strong>Total Students:</strong> {reportData.statistics.totalStudents}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Students by Grade</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportData.statistics.byGrade.map((stat, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{stat.grade_name}</p>
                    <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">All Students</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.class_name}</TableCell>
                      <TableCell>{student.grade_name}</TableCell>
                      <TableCell>{student.enrollment_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${reportData.summary.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold text-blue-600">${reportData.summary.totalBilled.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">${reportData.summary.outstandingBalance.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payments</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{payment.payment_date}</TableCell>
                      <TableCell>{payment.first_name} {payment.last_name}</TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'attendance_report':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-600">{reportData.statistics.attendanceRate}%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.statistics.present}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{reportData.statistics.absent}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.statistics.late}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Attendance Records</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.attendance.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell>{att.date}</TableCell>
                      <TableCell>{att.first_name} {att.last_name}</TableCell>
                      <TableCell>{att.class_name}</TableCell>
                      <TableCell className="capitalize">{att.status}</TableCell>
                      <TableCell>{att.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default:
        return <div>Select a report type</div>;
    }
  };

  const availableReports = getAvailableReports();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Reports</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                id="report-type"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <SelectItem value="">Select Report</SelectItem>
                {availableReports.map((report) => (
                  <SelectItem key={report.value} value={report.value}>
                    {report.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {selectedReport && ['academic', 'attendance', 'fees'].includes(selectedReport) && (
              <div>
                <Label htmlFor="student-select">Student</Label>
                <Select
                  id="student-select"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={user.role === 'student'}
                >
                  <SelectItem value="">Select Student</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {selectedReport && ['class_performance', 'attendance_report'].includes(selectedReport) && (
              <div>
                <Label htmlFor="class-select">Class</Label>
                <Select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <SelectItem value="">Select Class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {selectedReport === 'enrollment' && (
              <div>
                <Label htmlFor="grade-select">Grade</Label>
                <Select
                  id="grade-select"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <SelectItem value="">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {selectedReport && ['attendance', 'financial', 'attendance_report', 'enrollment'].includes(selectedReport) && (
              <>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Button onClick={generateReport} disabled={loading || !selectedReport}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {reportData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{getReportTitle()}</h2>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={printReport} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            <div className="print-content">
              {renderReportContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
