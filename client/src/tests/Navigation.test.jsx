import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import App from '../App';

jest.mock('../utils/axios');

describe('Navigation', () => {
  it('navigates to login page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('navigates between protected routes', () => {
    const history = createMemoryHistory();
    history.push('/dashboard');

    render(
      <Router location={history.location} navigator={history}>
        <App />
      </Router>
    );

    // Should redirect to login if not authenticated
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('shows navigation links in dashboard', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // After login, should see dashboard navigation
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('navigates to different sections via buttons', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const studentsButton = screen.getByText(/students/i);
    expect(studentsButton).toBeInTheDocument();
  });

  it('shows back button on sub-pages', () => {
    const history = createMemoryHistory();
    history.push('/students');

    render(
      <Router location={history.location} navigator={history}>
        <App />
      </Router>
    );

    const backButton = screen.getByText(/back/i);
    expect(backButton).toBeInTheDocument();
  });

  it('logout redirects to login page', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('token')).toBeNull();
  });
});
