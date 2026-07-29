import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Printer, Download, FileText, DollarSign } from 'lucide-react';

function ReportCard() {
  const { studentId } = useParams();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportCard();
  }, [studentId, academicYear]);

  const fetchReportCard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/report-cards/student/${studentId}?academicYear=${academicYear}`);
      setReportCard(response.data.data);
      setError('');
    } catch (err) {
      if (err.response?.data?.error?.includes('outstanding fee')) {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch report card');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600', label: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', label: 'Good' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', label: 'Fair' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', label: 'Below Average' };
    return { grade: 'F', color: 'text-red-600', label: 'Fail' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading report card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert variant="destructive" className="mb-6">
            <DollarSign className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {reportCard?.feeStatus && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Fee Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Fees:</span>
                    <span className="font-semibold">${reportCard.feeStatus.totalFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-semibold text-green-600">${reportCard.feeStatus.totalPayments.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Outstanding Balance:</span>
                    <span className="font-semibold text-red-600">${reportCard.feeStatus.outstandingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  const student = reportCard?.student;
  const teacher = reportCard?.teacher;
  const subjects = reportCard?.subjects || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Report Card - Printable Area */}
        <div className="bg-white shadow-lg p-8 print:shadow-none print:p-4" id="report-card">
          {/* School Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">SIM TECHNOLOGY INSTITUTE</h1>
            <p className="text-gray-600">Excellence in Education</p>
            <p className="text-sm text-gray-500">Academic Report Card</p>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Student Name:</p>
              <p className="font-semibold">{student?.first_name} {student?.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student ID:</p>
              <p className="font-semibold">{student?.student_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grade:</p>
              <p className="font-semibold">{student?.grade_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class:</p>
              <p className="font-semibold">{student?.class_name} ({student?.division_name})</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Academic Year:</p>
              <p className="font-semibold">{reportCard?.academicYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class Teacher:</p>
              <p className="font-semibold">{teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A'}</p>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Academic Performance</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Subject</th>
                  <th className="border border-gray-300 p-2 text-center">Term 1</th>
                  <th className="border border-gray-300 p-2 text-center">Term 2</th>
                  <th className="border border-gray-300 p-2 text-center">Term 3</th>
                  <th className="border border-gray-300 p-2 text-center">Exam</th>
                  <th className="border border-gray-300 p-2 text-center">Yearly Avg</th>
                  <th className="border border-gray-300 p-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => {
                  const gradeInfo = getLetterGrade(subject.yearlyAverage);
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2 font-medium">{subject.subject}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.term1 || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.term2 || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.term3 || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.exam || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">{subject.yearlyAverage}</td>
                      <td className={`border border-gray-300 p-2 text-center font-bold ${gradeInfo.color}`}>
                        {subject.letterGrade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grading Scale */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">Grading Scale</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-bold text-green-600">A = 90-100</span> Excellent</div>
              <div><span className="font-bold text-blue-600">B = 80-89</span> Good</div>
              <div><span className="font-bold text-yellow-600">C = 70-79</span> Fair</div>
              <div><span className="font-bold text-orange-600">D = 60-69</span> Below Average</div>
              <div><span className="font-bold text-red-600">F = Below 60</span> Fail</div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Performance Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Average:</span>
                    <span className="font-bold">{reportCard?.overallAverage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Grade:</span>
                    <span className={`font-bold ${getLetterGrade(reportCard?.overallAverage).color}`}>
                      {reportCard?.overallLetterGrade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Rank:</span>
                    <span className="font-bold">{reportCard?.rank} / {reportCard?.classSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Attendance Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className="font-bold text-green-600">{reportCard?.attendance?.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <span className="font-bold text-red-600">{reportCard?.attendance?.absent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late:</span>
                    <span className="font-bold text-yellow-600">{reportCard?.attendance?.late}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Total Days:</span>
                    <span className="font-bold">{reportCard?.attendance?.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conduct Section */}
          <div className="mb-6 p-4 border border-gray-300 rounded">
            <h3 className="font-bold mb-2">Conduct & Behavior</h3>
            <p className="text-sm text-gray-600">
              The student has demonstrated good conduct and behavior throughout the academic year.
              Regular attendance and active participation in class activities have been noted.
            </p>
          </div>

          {/* Promotion Statement */}
          <div className="mb-6 p-4 border border-gray-300 rounded bg-green-50">
            <h3 className="font-bold mb-2 text-green-800">Promotion Status</h3>
            <p className="text-sm text-green-700">
              {reportCard?.overallAverage >= 60 
                ? 'The student is PROMOTED to the next grade level.'
                : 'The student requires additional support and may need to repeat the current grade.'}
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
            <div className="text-center">
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-semibold">Class Teacher</p>
              <p className="text-xs text-gray-500">{teacher ? `${teacher.first_name} ${teacher.last_name}` : ''}</p>
            </div>
            <div className="text-center">
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-semibold">Parent/Guardian</p>
              <p className="text-xs text-gray-500">Signature</p>
            </div>
            <div className="text-center">
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-semibold">Principal</p>
              <p className="text-xs text-gray-500">Signature</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p className="font-semibold">SIM TECHNOLOGY INSTITUTE</p>
            <p>"Excellence in Education"</p>
            <p className="text-xs mt-2">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          #report-card {
            box-shadow: none;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportCard;
