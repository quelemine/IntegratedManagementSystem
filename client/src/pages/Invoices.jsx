import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Search, Download, Printer, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function Invoices() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('invoice_number');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/invoices');
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (id) => {
    try {
      const response = await axios.get(`/invoices/${id}`);
      setSelectedInvoice(response.data.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${invoice.student_first_name} ${invoice.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aVal = a[sortColumn]
    let bVal = b[sortColumn]
    
    if (sortColumn === 'student_name') {
      aVal = `${a.student_first_name} ${a.student_last_name}`
      bVal = `${b.student_first_name} ${b.student_last_name}`
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage)
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvoices(paginatedInvoices.map(i => i.id))
    } else {
      setSelectedInvoices([])
    }
  }

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(iid => iid !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const headers = ['Invoice #', 'Student', 'Academic Year', 'Total', 'Due Date', 'Status', 'Balance Due']
    const rows = sortedInvoices.map(i => [
      i.invoice_number,
      `${i.student_first_name} ${i.student_last_name}`,
      i.academic_year,
      (i?.total_amount ?? 0).toLocaleString(),
      new Date(i.due_date).toLocaleDateString(),
      i.status,
      (i?.balance_due ?? 0).toLocaleString()
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invoices_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

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
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Invoice Management</h1>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" className="text-sm sm:text-base">
                  <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedInvoice ? (
          <div>
            <Button
              onClick={() => setSelectedInvoice(null)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Invoices
            </Button>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Invoice #{selectedInvoice.invoice_number}</h2>
                  <p className="text-gray-600">Student: {selectedInvoice.student_first_name} {selectedInvoice.student_last_name}</p>
                  <p className="text-gray-600">Student ID: {selectedInvoice.student_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500">Academic Year</p>
                  <p className="font-medium">{selectedInvoice.academic_year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subtotal</p>
                  <p className="font-medium">{(selectedInvoice?.subtotal ?? 0).toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Discount</p>
                  <p className="font-medium">{(selectedInvoice?.discount_amount ?? 0).toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">{(selectedInvoice?.total_amount ?? 0).toLocaleString()} {selectedInvoice.currency}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Balance Due</p>
                  <p className="text-2xl font-bold text-blue-600">{(selectedInvoice?.balance_due ?? 0).toLocaleString()} {selectedInvoice.currency}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{(item?.unit_price ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{(item?.amount ?? 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method}</TableCell>
                          <TableCell>{(payment?.amount ?? 0).toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_reference || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <p className="text-gray-500">Notes</p>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by invoice number or student..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paginatedInvoices.length > 0 && selectedInvoices.length === paginatedInvoices.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedInvoices.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={paginatedInvoices.length > 0 && selectedInvoices.length === paginatedInvoices.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('invoice_number')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Invoice #
                        {sortColumn === 'invoice_number' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('student_name')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Student
                        {sortColumn === 'student_name' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('total_amount')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Total
                        {sortColumn === 'total_amount' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('due_date')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Due Date
                        {sortColumn === 'due_date' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className={selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.student_first_name} {invoice.student_last_name}</TableCell>
                      <TableCell>{invoice.academic_year}</TableCell>
                      <TableCell>
                        {(invoice?.total_amount ?? 0).toLocaleString()} {invoice.currency}
                      </TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(invoice?.balance_due ?? 0).toLocaleString()} {invoice.currency}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchInvoiceDetails(invoice.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginatedInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">No invoices found</div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
