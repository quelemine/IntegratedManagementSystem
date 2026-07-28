import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, TrendingUp, Award, AlertTriangle, Users, BarChart3 } from 'lucide-react';

export default function AdminAcademicReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [needsAttention, setNeedsAttention] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [term, setTerm] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'principal') {
      fetchReports();
      fetchTopStudents();
      fetchNeedsAttention();
    }
  }, [user, term, academicYear]);

  const fetchReports = async () => {
    try {
      const params = {};
      if (term !== 'all') params.term = term;
      if (academicYear !== 'all') params.academicYear = academicYear;
      
      const response = await axios.get('/academic-progress/school/reports', { params });
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStudents = async () => {
    try {
      const params = {};
      if (term !== 'all') params.term = term;
      if (academicYear !== 'all') params.academicYear = academicYear;
      
      const response = await axios.get('/academic-progress/school/top-students', { params });
      setTopStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching top students:', error);
    }
  };

  const fetchNeedsAttention = async () => {
    try {
      const params = {};
      if (term !== 'all') params.term = term;
      if (academicYear !== 'all') params.academicYear = academicYear;
      
      const response = await axios.get('/academic-progress/school/needs-attention', { params });
      setNeedsAttention(response.data.data);
    } catch (error) {
      console.error('Error fetching students needing attention:', error);
    }
  };

  const getPerformanceLevelColor = (level) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceLevelLabel = (level) => {
    switch (level) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'satisfactory': return 'Satisfactory';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'N/A';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-bold">Academic Reports</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 bg-white"
              >
                <option value="all">All Terms</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 bg-white"
              >
                <option value="all">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`px-4 py-2 rounded ${activeTab === 'top' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Top Students
          </button>
          <button
            onClick={() => setActiveTab('attention')}
            className={`px-4 py-2 rounded ${activeTab === 'attention' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Needs Attention
          </button>
        </div>

        {activeTab === 'overview' && reports && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{reports.stats.total_students}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average GPA</p>
                    <p className="text-2xl font-bold">{reports.stats.average_gpa}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Attendance</p>
                    <p className="text-2xl font-bold">{reports.stats.average_attendance}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Excellent</p>
                    <p className="text-2xl font-bold">{reports.stats.performance_levels.excellent}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Performance Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{reports.stats.performance_levels.excellent}</p>
                  <p className="text-sm text-gray-600">Excellent</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{reports.stats.performance_levels.good}</p>
                  <p className="text-sm text-gray-600">Good</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{reports.stats.performance_levels.satisfactory}</p>
                  <p className="text-sm text-gray-600">Satisfactory</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{reports.stats.performance_levels.needs_improvement}</p>
                  <p className="text-sm text-gray-600">Needs Improvement</p>
                </div>
              </div>
            </div>

            {/* All Students Report */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">All Students</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Student</th>
                      <th className="text-left py-3 px-4 font-medium">Term</th>
                      <th className="text-left py-3 px-4 font-medium">Year</th>
                      <th className="text-left py-3 px-4 font-medium">GPA</th>
                      <th className="text-left py-3 px-4 font-medium">Attendance</th>
                      <th className="text-left py-3 px-4 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{report.first_name} {report.last_name}</div>
                          <div className="text-sm text-gray-600">{report.email}</div>
                        </td>
                        <td className="py-3 px-4">{report.term}</td>
                        <td className="py-3 px-4">{report.academic_year}</td>
                        <td className="py-3 px-4 font-medium">{report.gpa || 'N/A'}</td>
                        <td className="py-3 px-4">{report.attendance_percentage || 0}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getPerformanceLevelColor(report.performance_level)}`}>
                            {getPerformanceLevelLabel(report.performance_level)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'top' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Students
            </h2>
            {topStudents.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">{student.term} {student.academic_year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">{student.gpa}</p>
                      <p className="text-sm text-gray-600">GPA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attention' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Students Needing Attention
            </h2>
            {needsAttention.length === 0 ? (
              <p className="text-gray-500">No students need attention</p>
            ) : (
              <div className="space-y-4">
                {needsAttention.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-sm text-gray-600">{student.term} {student.academic_year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">{student.gpa}</p>
                      <p className="text-sm text-gray-600">GPA</p>
                      {student.teacher_comments && (
                        <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">{student.teacher_comments}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
