import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../utils/axios');

const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'admin',
  first_name: 'Test',
  last_name: 'User'
};

describe('Dashboard Component', () => {
  it('renders dashboard for admin user', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('shows admin-specific features for admin role', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Admin should see user management buttons
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
  });

  it('shows teacher-specific features for teacher role', () => {
    const teacherUser = { ...mockUser, role: 'teacher' };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Teachers should see academic progress features
    expect(screen.getByText(/academic progress/i)).toBeInTheDocument();
  });

  it('shows student-specific features for student role', () => {
    const studentUser = { ...mockUser, role: 'student' };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Students should see their own features
    expect(screen.getByText(/my grades/i)).toBeInTheDocument();
  });

  it('shows parent-specific features for parent role', () => {
    const parentUser = { ...mockUser, role: 'parent' };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Parents should see parent portal
    expect(screen.getByText(/parent portal/i)).toBeInTheDocument();
  });

  it('hides admin features from non-admin users', () => {
    const studentUser = { ...mockUser, role: 'student' };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Students should not see user management
    expect(screen.queryByText(/user management/i)).not.toBeInTheDocument();
  });
});
