import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import HelpDesk from './components/HelpDesk'
import Login from './pages/Login'
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
import AuditLogs from './pages/AuditLogs'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
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
            <Route path="/audit-logs" element={<><AuditLogs /><HelpDesk /></>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
