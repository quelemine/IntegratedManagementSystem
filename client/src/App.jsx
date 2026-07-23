import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/divisions" element={<Divisions />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/users" element={<Users />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/grade-report" element={<GradeReport />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/messages/:id" element={<MessageView />} />
            <Route path="/messages/compose" element={<ComposeMessage />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
