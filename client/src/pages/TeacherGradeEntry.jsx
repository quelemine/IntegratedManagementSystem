import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { ArrowLeft, Save, Users, BookOpen } from 'lucide-react';

export default function TeacherGradeEntry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [term, setTerm] = useState('Fall');
  const [academicYear, setAcademicYear] = useState('2024-2025');

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchTeacherClasses();
    }
  }, [user]);

  const fetchTeacherClasses = async () => {
    try {
      const response = await axios.get('/teachers/my-classes');
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);
    try {
      const response = await axios.get(`/classes/${classId}/students`);
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleGradeUpdate = async (studentId, field, value) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const student of students) {
        if (student.progressId) {
          await axios.put(`/academic-progress/student/${student.id}`, {
            term,
            academic_year: academicYear,
            gpa: student.gpa,
            attendance_percentage: student.attendance_percentage,
            total_assignments: student.total_assignments,
            completed_assignments: student.completed_assignments,
            total_exams: student.total_exams,
            average_exam_score: student.average_exam_score,
            teacher_comments: student.teacher_comments,
            overall_performance: student.overall_performance
          });
        } else {
          await axios.post(`/academic-progress/student/${student.id}`, {
            term,
            academic_year: academicYear,
            gpa: student.gpa,
            attendance_percentage: student.attendance_percentage,
            total_assignments: student.total_assignments,
            completed_assignments: student.completed_assignments,
            total_exams: student.total_exams,
            average_exam_score: student.average_exam_score,
            teacher_comments: student.teacher_comments,
            overall_performance: student.overall_performance
          });
        }
      }
      alert('Grades saved successfully');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades');
    } finally {
      setSaving(false);
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
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Grade Entry</h1>
              <button
                onClick={handleSave}
                disabled={saving || !selectedClass}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Class Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Class
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass || ''}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.division_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
              >
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
                className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grade Entry Table */}
        {!selectedClass ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a class to enter grades</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>No students in this class</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Student Grades</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">GPA</th>
                    <th className="text-left py-3 px-4 font-medium">Attendance %</th>
                    <th className="text-left py-3 px-4 font-medium">Assignments (Done/Total)</th>
                    <th className="text-left py-3 px-4 font-medium">Total Exams</th>
                    <th className="text-left py-3 px-4 font-medium">Avg Exam Score</th>
                    <th className="text-left py-3 px-4 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-gray-600">{student.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={student.gpa || ''}
                          onChange={(e) => handleGradeUpdate(student.id, 'gpa', e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={student.attendance_percentage || ''}
                          onChange={(e) => handleGradeUpdate(student.id, 'attendance_percentage', e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={student.completed_assignments || ''}
                            onChange={(e) => handleGradeUpdate(student.id, 'completed_assignments', e.target.value)}
                            className="w-16 px-2 py-1 border rounded"
                          />
                          <span>/</span>
                          <input
                            type="number"
                            min="0"
                            value={student.total_assignments || ''}
                            onChange={(e) => handleGradeUpdate(student.id, 'total_assignments', e.target.value)}
                            className="w-16 px-2 py-1 border rounded"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={student.total_exams || ''}
                          onChange={(e) => handleGradeUpdate(student.id, 'total_exams', e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={student.average_exam_score || ''}
                          onChange={(e) => handleGradeUpdate(student.id, 'average_exam_score', e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <textarea
                          value={student.teacher_comments || ''}
                          onChange={(e) => handleGradeUpdate(student.id, 'teacher_comments', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          rows="2"
                          placeholder="Add comments..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
