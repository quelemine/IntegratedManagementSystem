// Main Application Component
// Routes for all pages in the Integrated Management System
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import HelpDesk from './components/HelpDesk'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Parents from './pages/Parents'
import Classes from './pages/Classes'
import Divisions from './pages/Divisions'
import Grades from './pages/Grades'
import Schools from './pages/Schools'
import Users from './pages/Users'
import Attendance from './pages/Attendance'
import Assignments from './pages/Assignments'
import Quizzes from './pages/Quizzes'
import GradeReport from './pages/GradeReport'
import Fees from './pages/Fees'
import Invoices from './pages/Invoices'
import Payments from './pages/Payments'
import FinancialReports from './pages/FinancialReports'
import Inbox from './pages/Inbox'
import MessageView from './pages/MessageView'
import ComposeMessage from './pages/ComposeMessage'
import Announcements from './pages/Announcements'
import Notifications from './pages/Notifications'
import NotificationSettings from './pages/NotificationSettings'
import AuditLogs from './pages/AuditLogs'
import Documents from './pages/Documents'
import Reports from './pages/Reports'
import AcademicProgress from './pages/AcademicProgress'
import TeacherGradeEntry from './pages/TeacherGradeEntry'
import AdminAcademicReports from './pages/AdminAcademicReports'
import ParentPortal from './pages/ParentPortal'
import ParentDashboard from './pages/ParentDashboard'
import ParentStudentRelationships from './pages/ParentStudentRelationships'
import ParentChildProfile from './pages/ParentChildProfile'
import ParentChildAttendance from './pages/ParentChildAttendance'
import ParentChildGrades from './pages/ParentChildGrades'
import ParentChildAssignments from './pages/ParentChildAssignments'
import ParentChildFees from './pages/ParentChildFees'
import ParentChildAnnouncements from './pages/ParentChildAnnouncements'
import FinanceDashboard from './pages/FinanceDashboard'
import PrincipalDashboard from './pages/PrincipalDashboard'
import VicePrincipalDashboard from './pages/VicePrincipalDashboard'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<><ChangePassword /><HelpDesk /></>} />
            <Route path="/dashboard" element={<><Dashboard /><HelpDesk /></>} />
            <Route path="/profile" element={<><Profile /><HelpDesk /></>} />
            <Route path="/students" element={<><Students /><HelpDesk /></>} />
            <Route path="/teachers" element={<><Teachers /><HelpDesk /></>} />
            <Route path="/parents" element={<><Parents /><HelpDesk /></>} />
            <Route path="/classes" element={<><Classes /><HelpDesk /></>} />
            <Route path="/divisions" element={<><Divisions /><HelpDesk /></>} />
            <Route path="/grades" element={<><Grades /><HelpDesk /></>} />
            <Route path="/schools" element={<><Schools /><HelpDesk /></>} />
            <Route path="/users" element={<><Users /><HelpDesk /></>} />
            <Route path="/attendance" element={<><Attendance /><HelpDesk /></>} />
            <Route path="/assignments" element={<><Assignments /><HelpDesk /></>} />
            <Route path="/quizzes" element={<><Quizzes /><HelpDesk /></>} />
            <Route path="/grade-report" element={<><GradeReport /><HelpDesk /></>} />
            <Route path="/fees" element={<><Fees /><HelpDesk /></>} />
            <Route path="/invoices" element={<><Invoices /><HelpDesk /></>} />
            <Route path="/payments" element={<><Payments /><HelpDesk /></>} />
            <Route path="/financial-reports" element={<><FinancialReports /><HelpDesk /></>} />
            <Route path="/inbox" element={<><Inbox /><HelpDesk /></>} />
            <Route path="/messages/:id" element={<><MessageView /><HelpDesk /></>} />
            <Route path="/messages/compose" element={<><ComposeMessage /><HelpDesk /></>} />
            <Route path="/announcements" element={<><Announcements /><HelpDesk /></>} />
            <Route path="/notifications" element={<><Notifications /><HelpDesk /></>} />
            <Route path="/notification-settings" element={<><NotificationSettings /><HelpDesk /></>} />
            <Route path="/audit-logs" element={<><AuditLogs /><HelpDesk /></>} />
            <Route path="/documents" element={<><Documents /><HelpDesk /></>} />
            <Route path="/reports" element={<><Reports /><HelpDesk /></>} />
            <Route path="/academic-progress" element={<><AcademicProgress /><HelpDesk /></>} />
            <Route path="/grade-entry" element={<><TeacherGradeEntry /><HelpDesk /></>} />
            <Route path="/academic-reports" element={<><AdminAcademicReports /><HelpDesk /></>} />
            <Route path="/parent-portal" element={<><ParentPortal /><HelpDesk /></>} />
            <Route path="/parent-dashboard" element={<><ParentDashboard /><HelpDesk /></>} />
            <Route path="/parent-student-relationships" element={<><ParentStudentRelationships /><HelpDesk /></>} />
            <Route path="/parent/profile/:childId" element={<><ParentChildProfile /><HelpDesk /></>} />
            <Route path="/parent/attendance/:childId" element={<><ParentChildAttendance /><HelpDesk /></>} />
            <Route path="/parent/grades/:childId" element={<><ParentChildGrades /><HelpDesk /></>} />
            <Route path="/parent/assignments/:childId" element={<><ParentChildAssignments /><HelpDesk /></>} />
            <Route path="/parent/fees/:childId" element={<><ParentChildFees /><HelpDesk /></>} />
            <Route path="/parent/announcements/:childId" element={<><ParentChildAnnouncements /><HelpDesk /></>} />
            <Route path="/finance-dashboard" element={<><FinanceDashboard /><HelpDesk /></>} />
            <Route path="/principal-dashboard" element={<><PrincipalDashboard /><HelpDesk /></>} />
            <Route path="/vice-principal-dashboard" element={<><VicePrincipalDashboard /><HelpDesk /></>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
