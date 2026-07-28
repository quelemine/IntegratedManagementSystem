import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, TrendingUp, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

export default function AcademicProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentIdAndData();
    }
  }, [user]);

  const fetchStudentIdAndData = async () => {
    try {
      const studentResponse = await axios.get('/students/me');
      const studentId = studentResponse.data.data.id;
      fetchProgress(studentId);
      fetchSubjectPerformance(studentId);
      fetchHistory(studentId);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchProgress = async (studentId) => {
    try {
      const params = {};
      if (selectedTerm !== 'all') params.term = selectedTerm;
      if (selectedYear !== 'all') params.academicYear = selectedYear;
      
      const response = await axios.get(`/academic-progress/student/${studentId}`, { params });
      setProgress(response.data.data[0] || null);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchSubjectPerformance = async (studentId) => {
    try {
      const response = await axios.get(`/academic-progress/student/${studentId}/subjects`);
      setSubjectPerformance(response.data.data);
    } catch (error) {
      console.error('Error fetching subject performance:', error);
    }
  };

  const fetchHistory = async (studentId) => {
    try {
      const response = await axios.get(`/academic-progress/student/${studentId}/history`);
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
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
            <h1 className="text-lg sm:text-xl font-bold">Academic Progress</h1>
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
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
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

        {!progress ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No academic progress data available</p>
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overall Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">GPA</p>
                  <p className="text-2xl font-bold text-blue-600">{progress.gpa || 'N/A'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-green-600">{progress.attendance_percentage || 0}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {progress.completed_assignments || 0}/{progress.total_assignments || 0}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${getPerformanceLevelColor(progress.performance_level)}`}>
                  <p className="text-sm font-medium">Performance</p>
                  <p className="text-xl font-bold">{getPerformanceLevelLabel(progress.performance_level)}</p>
                </div>
              </div>

              {progress.teacher_comments && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Teacher Comments</p>
                  <p className="text-gray-600">{progress.teacher_comments}</p>
                </div>
              )}
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Performance
              </h2>
              {subjectPerformance.length === 0 ? (
                <p className="text-gray-500">No subject performance data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Subject</th>
                        <th className="text-left py-3 px-4 font-medium">Average Score</th>
                        <th className="text-left py-3 px-4 font-medium">Letter Grade</th>
                        <th className="text-left py-3 px-4 font-medium">Attendance</th>
                        <th className="text-left py-3 px-4 font-medium">Assignments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectPerformance.map((subject) => (
                        <tr key={subject.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{subject.subject_name}</td>
                          <td className="py-3 px-4">{subject.average_score || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
                              {subject.letter_grade || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{subject.attendance_percentage || 0}%</td>
                          <td className="py-3 px-4">
                            {subject.assignments_completed || 0}/{subject.total_assignments || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Academic History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Academic History
              </h2>
              {history.length === 0 ? (
                <p className="text-gray-500">No academic history available</p>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{record.term} {record.academic_year}</h3>
                          <p className="text-sm text-gray-600">GPA: {record.gpa || 'N/A'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceLevelColor(record.performance_level)}`}>
                          {getPerformanceLevelLabel(record.performance_level)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Attendance:</span> {record.attendance_percentage || 0}%
                        </div>
                        <div>
                          <span className="text-gray-600">Assignments:</span> {record.completed_assignments || 0}/{record.total_assignments || 0}
                        </div>
                        <div>
                          <span className="text-gray-600">Exams:</span> {record.total_exams || 0}
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Exam Score:</span> {record.average_exam_score || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
