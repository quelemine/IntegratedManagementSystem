# Phase 3 Financial Features - Architecture Design

## Overview
This document outlines the architecture for the Financial Features module of the Integrated Management System.

## Database Schema Design

### 1. Fee Categories Table
**Purpose:** Define types of fees (tuition, registration, library, lab, etc.)

```sql
CREATE TABLE fee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Tuition Structures Table
**Purpose:** Define tuition fee structures by grade/level

```sql
CREATE TABLE tuition_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  grade_id UUID REFERENCES grades(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Class Fees Table
**Purpose:** Define fees specific to classes/subjects

```sql
CREATE TABLE class_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  class_id UUID REFERENCES classes(id) NOT NULL,
  fee_category_id UUID REFERENCES fee_categories(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Academic Year Fees Table
**Purpose:** Define general fees for academic year (registration, etc.)

```sql
CREATE TABLE academic_year_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  fee_category_id UUID REFERENCES fee_categories(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  academic_year VARCHAR(20) NOT NULL,
  student_category VARCHAR(50), -- e.g., 'new', 'returning', 'transfer'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Discounts Table
**Purpose:** Define discount rules (early payment, sibling, etc.)

```sql
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  applicable_to VARCHAR(50), -- 'tuition', 'all', 'specific'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Scholarships Table
**Purpose:** Define scholarship programs

```sql
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  scholarship_type VARCHAR(50) NOT NULL, -- 'merit', 'need', 'athletic'
  coverage_percentage DECIMAL(5,2), -- Percentage of fees covered
  max_amount DECIMAL(10,2),
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Student Fee Assignments Table
**Purpose:** Assign fees to specific students

```sql
CREATE TABLE student_fee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  student_id UUID REFERENCES students(id] NOT NULL,
  fee_type VARCHAR(50) NOT NULL, -- 'tuition', 'class_fee', 'academic_year_fee'
  fee_id UUID NOT NULL, -- References tuition_structures, class_fees, or academic_year_fees
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  academic_year VARCHAR(20) NOT NULL,
  discount_id UUID REFERENCES discounts(id),
  scholarship_id UUID REFERENCES scholarships(id),
  discounted_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'waived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Invoices Table
**Purpose:** Generate and track invoices

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Invoice Items Table
**Purpose:** Line items for invoices

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  fee_assignment_id UUID REFERENCES student_fee_assignments(id),
  description VARCHAR(200) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Payments Table
**Purpose:** Track payments against invoices

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  payment_method VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'mobile_money', 'online'
  transaction_reference VARCHAR(100),
  payment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Design

### Fee Management APIs

#### GET /api/fee-categories
- List all fee categories for the school
- Auth: Admin, Principal, Accountant

#### POST /api/fee-categories
- Create new fee category
- Auth: Admin, Accountant

#### GET /api/tuition-structures
- List tuition structures with filtering by grade, academic year
- Auth: Admin, Principal, Accountant

#### POST /api/tuition-structures
- Create tuition structure
- Auth: Admin, Accountant

#### GET /api/class-fees
- List class fees with filtering
- Auth: Admin, Principal, Accountant

#### POST /api/class-fees
- Create class fee
- Auth: Admin, Accountant

#### GET /api/discounts
- List all discounts
- Auth: Admin, Principal, Accountant

#### POST /api/discounts
- Create discount
- Auth: Admin, Accountant

#### GET /api/scholarships
- List all scholarships
- Auth: Admin, Principal, Accountant

#### POST /api/scholarships
- Create scholarship
- Auth: Admin, Accountant

### Student Fee Assignment APIs

#### GET /api/student-fee-assignments
- List fee assignments with filtering by student, academic year, status
- Auth: Admin, Principal, Accountant, Student (own), Parent (linked)

#### POST /api/student-fee-assignments
- Assign fee to student
- Auth: Admin, Accountant

#### PUT /api/student-fee-assignments/:id
- Update fee assignment (apply discount, scholarship)
- Auth: Admin, Accountant

#### DELETE /api/student-fee-assignments/:id
- Remove fee assignment
- Auth: Admin, Accountant

### Invoice Management APIs

#### GET /api/invoices
- List invoices with filtering by student, status, academic year
- Auth: Admin, Principal, Accountant, Student (own), Parent (linked)

#### POST /api/invoices
- Generate invoice for student
- Auth: Admin, Accountant

#### GET /api/invoices/:id
- Get invoice details with items
- Auth: Admin, Principal, Accountant, Student (own), Parent (linked)

#### PUT /api/invoices/:id
- Update invoice (notes, status)
- Auth: Admin, Accountant

#### DELETE /api/invoices/:id
- Cancel invoice
- Auth: Admin, Accountant

#### GET /api/invoices/:id/pdf
- Generate PDF invoice
- Auth: Admin, Principal, Accountant, Student (own), Parent (linked)

### Payment Management APIs

#### GET /api/payments
- List payments with filtering by student, date, method
- Auth: Admin, Principal, Accountant

#### POST /api/payments
- Record payment against invoice
- Auth: Admin, Accountant

#### GET /api/payments/:id
- Get payment details
- Auth: Admin, Principal, Accountant

#### PUT /api/payments/:id
- Update payment (notes, status)
- Auth: Admin, Accountant

#### POST /api/payments/:id/refund
- Process refund
- Auth: Admin, Accountant

### Financial Reports APIs

#### GET /api/reports/student-balances
- Report of outstanding balances by student
- Auth: Admin, Principal, Accountant

#### GET /api/reports/daily-payments
- Daily payment summary
- Auth: Admin, Principal, Accountant

#### GET /api/reports/monthly-revenue
- Monthly revenue breakdown
- Auth: Admin, Principal, Accountant

#### GET /api/reports/outstanding-fees
- Outstanding fees by category and status
- Auth: Admin, Principal, Accountant

#### GET /api/reports/payment-history
- Payment history with filtering
- Auth: Admin, Principal, Accountant, Student (own), Parent (linked)

## Frontend Pages Design

### 1. Fee Management Page
- View and manage fee categories
- View and manage tuition structures
- View and manage class fees
- View and manage discounts
- View and manage scholarships

### 2. Invoice Management Page
- List all invoices with filters
- Generate new invoices
- View invoice details
- Print/download PDF invoices
- Update invoice status

### 3. Payment Processing Page
- Record new payments
- View payment history
- Process refunds
- Payment reconciliation

### 4. Financial Reports Page
- Student balances report
- Daily payments report
- Monthly revenue report
- Outstanding fees report
- Payment history report

### 5. Student/Parent Financial Portal
- View own invoices
- View payment history
- Check outstanding balance
- Make payments (future integration)

## Role-Based Permissions Matrix

| Feature | Admin | Principal | Accountant | Teacher | Student | Parent |
|---------|-------|-----------|------------|---------|---------|--------|
| Fee Categories | CRUD | View | CRUD | - | - | - |
| Tuition Structures | CRUD | View | CRUD | - | - | - |
| Class Fees | CRUD | View | CRUD | - | - | - |
| Discounts | CRUD | View | CRUD | - | - | - |
| Scholarships | CRUD | View | CRUD | - | - | - |
| Fee Assignments | CRUD | View | CRUD | - | View Own | View Linked |
| Invoices | CRUD | View | CRUD | - | View Own | View Linked |
| Payments | CRUD | View | CRUD | - | View Own | View Linked |
| Financial Reports | All | All | All | - | Own | Linked |

## Implementation Order

### Phase 1: Database Schema
1. Create all financial table migrations
2. Add foreign key constraints
3. Create seed data for fee categories and structures
4. Run migrations

### Phase 2: Backend APIs
1. Create controllers for fees, invoices, payments
2. Create routes and register in index.js
3. Implement role-based middleware for financial endpoints
4. Add validation and error handling

### Phase 3: Frontend Pages
1. Create Fee Management page component
2. Create Invoice Management page component
3. Create Payment Processing page component
4. Create Financial Reports page component
5. Create Student/Parent Financial Portal
6. Add navigation routes

### Phase 4: Testing
1. Test all financial APIs with different roles
2. Test frontend pages with different user roles
3. Verify financial calculations
4. Test invoice generation
5. Test payment processing
6. Test reports generation

## Currency Support

The system will support multiple currencies:
- LRD (Liberian Dollar) - Default
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)

Currency conversion will be handled at the application level with exchange rates stored in configuration.

## Security Considerations

1. **Payment Security:** All payment operations require accountant or admin role
2. **Financial Data Access:** Strict role-based access control
3. **Audit Trail:** All financial operations logged with user and timestamp
4. **Transaction Integrity:** Database transactions for multi-step operations
5. **Data Validation:** Strict validation on all financial amounts and dates

## Integration Points

1. **Student Module:** Link fee assignments to students
2. **Academic Module:** Link fees to grades, classes, academic years
3. **User Module:** Link payments to users (received_by)
4. **Reporting Module:** Financial data for comprehensive reports

## Future Enhancements

1. Online payment gateway integration
2. Automated invoice generation
3. Payment reminders via email/SMS
4. Financial analytics dashboard
5. Budget management
6. Expense tracking
7. Payroll management
